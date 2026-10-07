import { UserCircle } from "lucide-react";

interface CreditBalanceCardProps {
  balance: number;
  userEmail: string;
}

export function CreditBalanceCard({ balance, userEmail }: CreditBalanceCardProps) {
  return (
    <div className="rounded-xl border border-primary bg-primary/10 p-4 md:p-6">
      <div className="flex items-center gap-3 md:gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/20 md:h-20 md:w-20">
          <UserCircle className="h-10 w-10 text-primary md:h-14 md:w-14" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-medium md:text-xl">เครดิตคงเหลือ</p>
          <p className="text-lg font-semibold text-primary md:text-2xl">
            {balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{" "}
            เครดิต
          </p>
          <p className="mt-1 truncate text-sm text-foreground/80 md:mt-2 md:text-base">
            {userEmail}
          </p>
        </div>
      </div>
    </div>
  );
}
