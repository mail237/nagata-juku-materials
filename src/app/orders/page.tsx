"use client";

import { OrderMemoManager } from "@/components/orders/OrderMemoManager";
import { Header } from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/PageContainer";
import { useAppData } from "@/hooks/useAppData";

export default function OrdersPage() {
  const { data, ready, addOrderMemo, updateOrderMemo, deleteOrderMemo } = useAppData();

  return (
    <>
      <Header title="発注メモ" backHref="/" />
      <PageContainer>
        {!ready || !data ? (
          <p className="py-8 text-center text-sm text-slate-500">読み込み中…</p>
        ) : (
          <div className="space-y-5">
            <OrderMemoManager
              memos={data.orderMemos}
              onAdd={addOrderMemo}
              onUpdate={updateOrderMemo}
              onDelete={deleteOrderMemo}
            />
          </div>
        )}
      </PageContainer>
    </>
  );
}
