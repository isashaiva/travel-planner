type Props = {
  budget: any;
};

export default function BudgetCard({ budget }: Props) {
  return (
    <div className="backdrop-blur-3xl bg-white/30 border border-white/50 rounded-[32px] p-8 shadow-xl">
      <h2 className="text-3xl font-black text-gray-800 mb-8">Budget</h2>

      <div className="space-y-4 text-lg">
        <div className="flex justify-between">
          <span>🏨 Hotel</span>
          <span>{budget.hotel} грн</span>
        </div>

        <div className="flex justify-between">
          <span>🍔 Food</span>
          <span>{budget.food} грн</span>
        </div>

        <div className="flex justify-between">
          <span>🚕 Transport</span>
          <span>{budget.transport} грн</span>
        </div>

        <div className="flex justify-between">
          <span>🎫 Tickets</span>
          <span>{budget.tickets} грн</span>
        </div>

        <div className="border-t pt-4 flex justify-between font-black text-2xl text-blue-600">
          <span>Total</span>
          <span>{budget.total} грн</span>
        </div>
      </div>
    </div>
  );
}
