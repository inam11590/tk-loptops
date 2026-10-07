"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  BrandSalesStat,
  OrderStatusStat,
  RevenueTimePoint,
} from "@/lib/admin/stats";
import { formatPrice } from "@/lib/config";

interface DashboardChartsProps {
  revenueOverTime: RevenueTimePoint[];
  ordersByStatus: OrderStatusStat[];
  salesByBrand: BrandSalesStat[];
}

export function DashboardCharts({
  revenueOverTime,
  ordersByStatus,
  salesByBrand,
}: DashboardChartsProps) {
  const totalOrdersCount = ordersByStatus.reduce((s, i) => s + i.count, 0);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      {/* Revenue Over Time (Area Chart) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:col-span-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Revenue Over Time
            </h3>
            <p className="text-xs text-muted-foreground">
              Gross non-cancelled order revenue across the selected period
            </p>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={revenueOverTime}
              margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.2)"
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(val) => `$${val}`}
              />
              <Tooltip
                formatter={(value) => [
                  formatPrice(Number(value ?? 0)),
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid rgba(148, 163, 184, 0.3)",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#revGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Orders by Status (Donut Chart) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:col-span-4">
        <div className="mb-4">
          <h3 className="font-heading text-base font-bold text-foreground">
            Orders by Status
          </h3>
          <p className="text-xs text-muted-foreground">
            Distribution of {totalOrdersCount} order(s)
          </p>
        </div>

        <div className="h-64 w-full">
          {totalOrdersCount === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              No orders recorded in this period yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="45%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                >
                  {ordersByStatus.map((entry) => (
                    <Cell key={entry.status} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    `${Number(value ?? 0)} order(s)`,
                    String(name ?? "Status"),
                  ]}
                  contentStyle={{
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  wrapperStyle={{ fontSize: "11px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Sales by Brand HP vs Dell (Bar Chart) */}
      <div className="rounded-2xl border border-border/80 bg-card p-5 shadow-card lg:col-span-12">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="font-heading text-base font-bold text-foreground">
              Sales by Brand: HP vs Dell
            </h3>
            <p className="text-xs text-muted-foreground">
              Revenue comparison between official HP and Dell laptop lines
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            {salesByBrand.map((b) => (
              <span key={b.brand} className="font-semibold text-foreground">
                {b.brand}:{" "}
                <strong className="text-accent">
                  {formatPrice(b.revenue)}
                </strong>{" "}
                ({b.units} units)
              </span>
            ))}
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={salesByBrand}
              margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(148, 163, 184, 0.2)"
              />
              <XAxis
                dataKey="brand"
                tick={{ fontSize: 12, fontWeight: 700, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                formatter={(value) => [
                  formatPrice(Number(value ?? 0)),
                  "Revenue",
                ]}
                contentStyle={{
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="revenue" radius={[10, 10, 0, 0]} maxBarSize={72}>
                {salesByBrand.map((entry) => (
                  <Cell
                    key={entry.brand}
                    fill={entry.brand === "HP" ? "#0284c7" : "#2563eb"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
