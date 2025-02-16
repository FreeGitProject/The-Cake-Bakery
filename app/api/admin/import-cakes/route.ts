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

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "cake-imports", resource_type: "raw", format: fileExtension }, 
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
      try {
        const cake = new Cake({
          name: row["name"],
          description: row["description"],
          caketype: row["caketype"],
          type: row["type"],
          prices: JSON.parse(row["prices"]),
          image: JSON.parse(row["image"]),
          category: row["category"],
          isAvailable: row["isAvailable"],
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
