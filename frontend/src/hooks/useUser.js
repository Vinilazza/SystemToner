import { useQuery } from "@tanstack/react-query";
import { meCompact, meProfile } from "@/services/user.service";
import { QK } from "@/lib/keys";

export function useMe() {
  return useQuery({ queryKey: QK.me, queryFn: meCompact });
}

export function useMyProfile() {
  return useQuery({ queryKey: QK.meProfile, queryFn: meProfile });
}
