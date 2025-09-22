import { ConfigurableSection } from "@/components/ConfigurableSection";

export const Product = () => {
  return (
    <div className="p-6">
      <div>
        <h1 className="text-lg font-bold">Product</h1>
        <iframe 
          src="https://airtable.com/embed/appwQNBnpJKVEWDhQ/shrGNNslwZHR4IbEj?viewControls=on" 
          width="100%"
          height="600"
          style={{ border: 'none' }}
          title="Product Data"
        />
      </div>
      <div>
        <h1 className="text-lg font-bold">Product Levers</h1>
        <iframe 
          src="https://airtable.com/embed/appwQNBnpJKVEWDhQ/shrDhS03gMF3fP4U8?viewControls=on" 
          width="100%" 
          height="600" 
          style={{ background: "transparent", border: "none"}}
          title="Product Levers Data"
        />
      </div>
    </div>
  );
};