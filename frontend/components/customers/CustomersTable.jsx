"use client";

import CustomersRow from "./CustomersRow";

const CustomersTable = ({ customers }) => {
  return (
    <div
      className="
      overflow-x-auto
      rounded-2xl
      border
      border-white/10
      bg-[#111827]
      "
    >
      <table className="min-w-full">
        <thead className="border-b border-white/10 bg-[#1E293B]">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Customer ID
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Name
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Email
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
              Phone
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
              Orders
            </th>
            <th
              className="py-4 text-right text-sm font-semibold text-slate-300"
              style={{ paddingLeft: 24, paddingRight: 32 }}
            >
              Total Spent
            </th>

            <th
              className="py-4 text-left text-sm font-semibold text-slate-300"
              style={{ paddingLeft: 32, paddingRight: 24 }}
            >
              Joined
            </th>
          </tr>
        </thead>

        <tbody>
          {customers.length > 0 ? (
            customers.map((customer) => (
              <CustomersRow key={customer.id} customer={customer} />
            ))
          ) : (
            <tr>
              <td colSpan={7} className="py-12 text-center text-slate-400">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CustomersTable;
