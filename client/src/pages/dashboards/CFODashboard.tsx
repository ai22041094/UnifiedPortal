import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Wallet,
  CreditCard,
  Receipt,
  Calculator,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/AppLayout";

const financialMetrics = {
  totalITSpend: 4250000,
  budgetUtilization: 78.5,
  costSavings: 850000,
  roi: 245,
  operationalCosts: 2150000,
  capitalExpenditure: 1200000,
};

const budgetCategories = [
  { name: "Infrastructure", allocated: 1500000, spent: 1125000, percentage: 75 },
  { name: "Software Licenses", allocated: 850000, spent: 782000, percentage: 92 },
  { name: "Personnel", allocated: 1200000, spent: 1080000, percentage: 90 },
  { name: "Cloud Services", allocated: 450000, spent: 378000, percentage: 84 },
  { name: "Security", allocated: 250000, spent: 187500, percentage: 75 },
];

const costTrends = [
  { month: "Jul", value: 380000 },
  { month: "Aug", value: 420000 },
  { month: "Sep", value: 385000 },
  { month: "Oct", value: 445000 },
  { month: "Nov", value: 398000 },
  { month: "Dec", value: 412000 },
];

const topExpenses = [
  { id: 1, category: "Cloud Infrastructure", amount: 125000, change: 12.5, direction: "up" },
  { id: 2, category: "Software Subscriptions", amount: 95000, change: -5.2, direction: "down" },
  { id: 3, category: "Hardware Procurement", amount: 78000, change: 8.7, direction: "up" },
  { id: 4, category: "Professional Services", amount: 65000, change: -15.3, direction: "down" },
  { id: 5, category: "Maintenance Contracts", amount: 45000, change: 2.1, direction: "up" },
];

export default function CFODashboard() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <AppLayout title="CFO Dashboard" appName="Dashboards">
      <div className="p-6 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <Card data-testid="card-total-spend">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total IT Spend</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-total-spend">{formatCurrency(financialMetrics.totalITSpend)}</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-amber-500" />
                    <span className="text-sm text-amber-500">+8.3% YoY</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-budget-utilization">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Budget Utilization</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-budget-utilization">{financialMetrics.budgetUtilization}%</h3>
                  <Progress value={financialMetrics.budgetUtilization} className="h-2 mt-2" />
                </div>
                <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <PieChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-cost-savings">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Cost Savings</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-cost-savings">{formatCurrency(financialMetrics.costSavings)}</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+24.6% vs target</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-roi">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">IT ROI</p>
                  <h3 className="text-2xl font-bold mt-1" data-testid="text-roi">{financialMetrics.roi}%</h3>
                  <div className="flex items-center mt-2 gap-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">+18% YoY</span>
                  </div>
                </div>
                <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Calculator className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card data-testid="card-budget-breakdown">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Budget Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {budgetCategories.map((category) => (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="font-medium text-sm" data-testid={`text-category-${category.name.toLowerCase().replace(' ', '-')}`}>{category.name}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{formatCurrency(category.spent)}</span>
                          <span className="text-xs text-muted-foreground"> / {formatCurrency(category.allocated)}</span>
                        </div>
                      </div>
                      <Progress value={category.percentage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card data-testid="card-top-expenses">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Top Expense Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between gap-4 py-2 border-b last:border-0">
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm" data-testid={`text-expense-${expense.id}`}>{expense.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{formatCurrency(expense.amount)}</span>
                        <div className={`flex items-center gap-0.5 text-xs ${
                          expense.direction === 'up' ? 'text-red-500' : 'text-green-500'
                        }`}>
                          {expense.direction === 'up' ? (
                            <ArrowUpRight className="h-3 w-3" />
                          ) : (
                            <ArrowDownRight className="h-3 w-3" />
                          )}
                          {Math.abs(expense.change)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
