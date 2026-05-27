type Props = {
  route: any[];
};

export default function RouteCard({ route }: Props) {
  return (
    <div className="backdrop-blur-3xl bg-white/30 border border-white/50 rounded-[32px] p-8 shadow-xl">
      <h2 className="text-3xl font-black text-gray-800 mb-8">
        Generated Route
      </h2>

      <div className="space-y-6">
        {route.map((item, index) => (
          <div key={index} className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-white flex items-center justify-center font-bold shadow-lg">
              {item.time}
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-800">{item.name}</h3>

              <p className="text-gray-500">{item.location}</p>

              <p className="text-yellow-500 mt-1">⭐ {item.rating}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
