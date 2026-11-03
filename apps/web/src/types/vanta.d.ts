declare module "vanta/dist/vanta.net.min" {
  interface VantaEffect {
    destroy: () => void;
    setOptions: (opts: Record<string, unknown>) => void;
    resize: () => void;
  }
  const NET: (opts: Record<string, unknown>) => VantaEffect;
  export default NET;
}
