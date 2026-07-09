export interface NotificationItem {
  id: string;
  type: "upcoming" | "confirmed";
  read: boolean;
  ticker: string;
  payDate: string | null;
  grossAmountForeign: number | null;
  foreignCurrency: string | null;
  amountToSetAsidePln: number | null;
}
