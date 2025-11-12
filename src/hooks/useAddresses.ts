// src/hooks/useAddresses.ts
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Address {
  id?: string;
  user_id?: string;
  house_number: string;
  street: string;
  area: string;
  city: string;
  state: string;
  pin_code: string;
  mobile: string;
  created_at?: string;
}

export const useAddresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAddresses = async () => {
    setLoading(true);
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user?.id) {
      setLoading(false);
      return [];
    }

    const { data: result, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    setLoading(false);

    if (error) {
      console.error(error);
      toast.error("Failed to fetch addresses");
      return [];
    }

    setAddresses(result || []);
    return result || [];
  };

  const insertAddress = async (address: Omit<Address, "id">) => {
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session?.user?.id) return toast.error("Please login first");

    const { error } = await supabase.from("addresses").insert([
      { user_id: session.user.id, ...address },
    ]);

    if (error) {
      console.error(error);
      toast.error("Failed to add address");
      return;
    }

    toast.success("Address added successfully!");
    fetchAddresses();
  };

  return {
    addresses,
    fetchAddresses,
    insertAddress,
    loading,
  };
};
