/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ImportLog } from "@/models/importLog";
import { Cake } from "@/models/cake";
import { v2 as cloudinary } from "cloudinary";
import * as xlsx from "xlsx";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
function validateRow(row: any): string | null {
  if (!row["name"] || !row["description"] || !row["caketype"] || !row["type"] || !row["prices"] || !row["image"]) {
    return "Missing required fields: name, description, caketype, type, prices, or image.";
  }
  try {
    const prices = JSON.parse(row["prices"]);
    if (!Array.isArray(prices) || prices.some(p => !p.weight || !p.sellPrice)) {
      return "Invalid prices format. Each price must have weight and sellPrice.";
    }
    const images = JSON.parse(row["image"]);
    if (!Array.isArray(images) || images.length === 0) {
      return "At least one image is required.";
    }
  } catch {
    return "Invalid JSON format in prices or image fields.";
  }
  return null;
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clientPromise;

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file extension
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
      return NextResponse.json({ error: "Invalid file type. Please upload an Excel file." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const publicId = `${file.name.split('.').slice(0, -1).join('.')}-${timestamp}`;

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "cake-imports", resource_type: "raw", format: fileExtension, public_id: publicId },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    // @ts-ignore
    const cloudinaryUrl = uploadResult.secure_url;

    const importLog = new ImportLog({
      fileName: file.name,
      cloudinaryUrl,
      importedBy: session.user.id,
      status: "Pending",
    });
    await importLog.save();

    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data : any[]= xlsx.utils.sheet_to_json(sheet);

    let successCount = 0, failureCount = 0;
    const errorDetails: string[] = [];

    for (const [index, row] of data.entries()) {
      const validationError = validateRow(row);
      if (validationError) {
        failureCount++;
        errorDetails.push(`Row ${index + 2}: ${validationError}`);
        continue;
      }
      try {
        const prices = JSON.parse(row["prices"]).map((p: any) => ({ weight: p.weight, costPrice: p.costPrice, sellPrice: p.sellPrice }));
        const cake = new Cake({
          name: row["name"],
          description: row["description"],
          caketype: row["caketype"],
          type: row["type"],
          prices,
          image: JSON.parse(row["image"]),
          category: row["category"],
          isAvailable: row["isAvailable"] === 'true' || row["isAvailable"] === true,
          fileName: `${file.name}-${timestamp}`,
        });
        await cake.save();
        successCount++;
      } catch (error: any) {
        failureCount++;
        errorDetails.push(`Row ${index + 2}: ${error.message}`);
      }
    }

    importLog.status = failureCount > 0 ? "Failed" : "Completed";
    importLog.totalRecords = data.length;
    importLog.successCount = successCount;
    importLog.failureCount = failureCount;
    importLog.errorDetails = errorDetails;
    await importLog.save();

    return NextResponse.json({ message: "Cakes imported successfully", importLog });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "An error occurred during import" }, { status: 500 });
  }
}
