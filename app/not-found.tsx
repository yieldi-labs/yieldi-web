import Button from "./button";

export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
      <Button href="/">Head home</Button>
    </div>
  );
}
