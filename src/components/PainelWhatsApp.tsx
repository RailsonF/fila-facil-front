import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { CheckCircle2, LoaderCircle, QrCode, WifiOff } from "lucide-react";
import { conectarSocket } from "../lib/socket";
import { Card } from "./ui/Card";

type Estado = "aguardando" | "conectado";

export default function PainelWhatsApp() {
  const [qr, setQr] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado>("aguardando");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const socket = conectarSocket();

    const aoQr = (codigo: string) => {
      setEstado("aguardando");
      setQr(codigo);
    };
    const aoConectar = () => {
      setEstado("conectado");
      setQr(null);
    };
    const aoReconectar = () => setEstado("aguardando");

    socket.on("qr_code_whatsapp", aoQr);
    socket.on("whatsapp_conectado", aoConectar);
    socket.on("disconnect", aoReconectar);

    return () => {
      socket.off("qr_code_whatsapp", aoQr);
      socket.off("whatsapp_conectado", aoConectar);
      socket.off("disconnect", aoReconectar);
    };
  }, []);

  useEffect(() => {
    if (!qr || !canvasRef.current) return;
    void QRCode.toCanvas(canvasRef.current, qr, {
      width: 208,
      margin: 1,
      color: { dark: "#0f172a", light: "#ffffff" },
    });
  }, [qr]);

  const conectado = estado === "conectado";

  return (
    <Card className="overflow-hidden">
      <div
        className={`flex items-center gap-2 border-b px-5 py-3.5 text-sm font-bold ${
          conectado
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-800"
        }`}
      >
        {conectado ? (
          <CheckCircle2 className="size-4" />
        ) : (
          <LoaderCircle className="size-4 animate-spin" />
        )}
        WhatsApp
        <span className="ml-auto text-xs font-semibold">
          {conectado ? "Sessão ativa" : "Aguardando pareamento"}
        </span>
      </div>

      <div className="p-5">
        {conectado ? (
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-500" />
            <p className="text-sm text-slate-600">
              A sessão está conectada e persistida. Os avisos da regra dos 3 estão
              sendo enviados automaticamente. Reiniciar o servidor não exige um novo
              QR Code.
            </p>
          </div>
        ) : qr ? (
          <div className="flex flex-col items-center gap-3">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <canvas ref={canvasRef} className="size-[208px]" />
            </div>
            <p className="text-center text-sm text-slate-600">
              No celular, abra{" "}
              <strong className="text-slate-900">WhatsApp → Aparelhos conectados → Conectar com número</strong>{" "}
              e escaneie o código.
            </p>
          </div>
        ) : (
          <div className="flex items-start gap-3">
            <QrCode className="mt-0.5 size-5 shrink-0 text-slate-400" />
            <p className="text-sm text-slate-600">
              Nenhum QR Code recebido ainda. O código aparece aqui automaticamente
              assim que o <strong className="text-slate-900">worker</strong> do
              RabbitMQ iniciar a sessão do Baileys.
            </p>
          </div>
        )}

        <p className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <WifiOff className="mt-0.5 size-3.5 shrink-0" />
          Se a fila funcionar normalmente sem WhatsApp, nada é perdido: a senha e a
          posição continuam sendo atualizadas em tempo real.
        </p>
      </div>
    </Card>
  );
}
