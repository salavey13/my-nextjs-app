// app/dynamicitemform/page.tsx
import DynamicItemForm from "@/components/DynamicItemForm";

export default function DynamicItemFormPage() {
  const itemType = "forklift"; // Replace this with actual logic to determine item type
  return <DynamicItemForm itemType={itemType} />;
}
