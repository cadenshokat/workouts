import { ConfigurableSection } from "@/components/ConfigurableSection";

export const Product = () => {
  return (
    <div className="p-6">
      <h1 className="text-lg font-bold">Product</h1>
      <iframe 
        src="https://airtable.com/embed/appwQNBnpJKVEWDhQ/shrGNNslwZHR4IbEj?viewControls=on" 
        width="100%"
        height="600"
        style={{ border: 'none' }}
        title="Marketing Data"
      />
    </div>
  );
};