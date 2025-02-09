// lib/orderCount.ts
import { Counter } from "@/models/counter";

/**
 * Generates the next order number using the Counter model.
 * @returns {Promise<string>} The generated order number.
 */
export const generateOrderNumber = async (): Promise<string> => {
  try {
    // Increment the counter and fetch the updated value
    const counter = await Counter.findOneAndUpdate(
      { name: "orderNumber" },
      { $inc: { value: 1 } },
      { new: true, upsert: true } // Create the counter document if it doesn't exist
    );

    // Generate the order number in the format: ORD-YYYYMMDD-0001
    //const date = new Date().toISOString().split("T")[0].replace(/-/g, ""); // Format: YYYYMMDD
    const orderNumber = `ORD-${String(counter.value).padStart(4, "0")}`;
    //const orderNumber = `ORD-${date}-${String(counter.value).padStart(4, "0")}`;

    return orderNumber;
  } catch (error) {
    console.error("Error generating order number:", error);
    throw new Error("Failed to generate order number");
  }
};
