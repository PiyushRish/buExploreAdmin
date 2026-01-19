const GenericGridPage = ({ title, subtitle, items, renderCard }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <h1 className="text-4xl font-bold text-center">{title}</h1>
      <p className="text-center text-gray-600">{subtitle}</p>

      <div className="grid grid-cols-3 gap-8 mt-8">
        {items.map((item) => renderCard(item))}
      </div>
    </div>
  );
};
