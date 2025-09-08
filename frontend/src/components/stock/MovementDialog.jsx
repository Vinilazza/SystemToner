import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createMovement } from "@/services/stock.services";
import { listToners } from "@/services/toner.service";
import { listPrinters } from "@/services/printer.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function MovementDialog({
  open,
  onOpenChange,
  defaultToner = null, // { _id, name } ou null
  onSuccess, // callback opcional
}) {
  const qc = useQueryClient();
  const [type, setType] = useState("in"); // in | out | adjust
  const [tonerId, setTonerId] = useState(defaultToner?._id || "");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [printerId, setPrinterId] = useState("");

  // Fetch opções quando necessário
  const { data: tonersData } = useQuery({
    queryKey: ["dlg-toners"],
    queryFn: () => listToners({ page: 1, limit: 50, onlyActive: true }),
    enabled: open && !defaultToner, // só carrega lista se não veio um toner fixo
  });
  const tonerOptions = useMemo(
    () =>
      (tonersData?.items || []).map((t) => ({
        id: t._id,
        label: t.name,
        sku: t.sku,
      })),
    [tonersData]
  );

  const { data: printersData } = useQuery({
    queryKey: ["dlg-printers"],
    queryFn: () => listPrinters({ page: 1, limit: 50, onlyActive: true }),
    enabled: open, // pode precisar para saída
  });
  const printerOptions = useMemo(
    () =>
      (printersData?.items || []).map((p) => ({
        id: p._id,
        label: p.name,
        loc: p.location,
      })),
    [printersData]
  );

  // Reset ao abrir/fechar
  useEffect(() => {
    if (open) {
      setType("in");
      setQuantity(1);
      setNote("");
      setPrinterId("");
      setTonerId(defaultToner?._id || "");
    }
  }, [open, defaultToner]);

  const mutation = useMutation({
    mutationFn: (payload) => createMovement(payload),
    onSuccess: (res) => {
      toast.success("Movimentação registrada!");
      // invalida listagens relevantes
      qc.invalidateQueries(); // simples: toners (estoque mudou), stock timeline, dashboard etc.
      onOpenChange?.(false);
      onSuccess?.(res);
    },
    onError: (e) =>
      toast.error(e?.response?.data?.error || "Não foi possível registrar"),
  });

  function handleSubmit(e) {
    e.preventDefault();

    if (!tonerId) return toast.error("Selecione o toner.");
    const q = Number(quantity);
    if (!Number.isFinite(q) || q < 0)
      return toast.error("Informe uma quantidade válida.");

    // Regras:
    // - in: q > 0
    // - out: q > 0
    // - adjust: q >= 0 (valor absoluto do novo estoque)
    if ((type === "in" || type === "out") && q <= 0)
      return toast.error("Quantidade deve ser maior que zero.");
    if (type === "adjust" && q < 0)
      return toast.error("Quantidade deve ser zero ou mais.");

    mutation.mutate({
      tonerId,
      type,
      quantity: q,
      note: note?.trim() || undefined,
      relatedPrinter: printerId || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar movimento</DialogTitle>
          <DialogDescription>
            Entrada, saída ou ajuste absoluto de estoque.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipo */}
          <div className="grid gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Entrada</SelectItem>
                <SelectItem value="out">Saída</SelectItem>
                <SelectItem value="adjust">Ajuste (define estoque)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Toner */}
          <div className="grid gap-2">
            <Label>Toner</Label>
            {defaultToner ? (
              <Input
                value={`${defaultToner.name}${
                  defaultToner.sku ? ` (${defaultToner.sku})` : ""
                }`}
                disabled
              />
            ) : (
              <Select value={tonerId} onValueChange={setTonerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o toner" />
                </SelectTrigger>
                <SelectContent>
                  {(tonerOptions || []).map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                      {t.sku ? ` (${t.sku})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Quantidade / Ajuste */}
            <div className="grid gap-2">
              <Label>
                {type === "adjust" ? "Novo estoque (absoluto)" : "Quantidade"}
              </Label>
              <Input
                type="number"
                min={type === "adjust" ? 0 : 1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>

            {/* Impressora (opcional; útil para Saída) */}
            <div className="grid gap-2">
              <Label>Impressora (opcional)</Label>
              <Select
                value={printerId || ""}
                onValueChange={(v) => setPrinterId(v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Vincular saída a uma impressora" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem vínculo</SelectItem>{" "}
                  {(printerOptions || []).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label}
                      {p.loc ? ` — ${p.loc}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Observação (opcional)</Label>
            <Textarea
              placeholder="Ex.: Compra na Cotação #123 / Instalado na recepção…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Separator />

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange?.(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Registrando…" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
