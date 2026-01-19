const GenericCard = ({
  title,
  location,
  description,
  badgeText,
  rating,
  priceText,
  onClick
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-5 cursor-pointer"
      onClick={onClick}
    >
      <div className="h-56 bg-black text-white flex items-center justify-center text-3xl font-bold">
        {badgeText}
      </div>

      <h3 className="text-xl font-bold mt-4">{title}</h3>
      <p className="text-sm text-gray-500">{location}</p>
      <p className="text-gray-600 mt-2">{description}</p>

      {rating && <p className="mt-2">⭐ {rating}</p>}
      {priceText && <p>{priceText}</p>}

      <button onClick={() => setIsLiked(!isLiked)}>
        ❤️ Like
      </button>
    </div>
  );
};
