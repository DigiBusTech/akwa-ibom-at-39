declare module "canvas-confetti" {
  export interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: Array<"square" | "circle" | "star">;
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
    useWorker?: boolean;
    resize?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;

  namespace confetti {
    export function create(
      canvas: HTMLCanvasElement,
      options?: { resize?: boolean; useWorker?: boolean }
    ): (options?: ConfettiOptions) => Promise<null> | null;
    export function reset(): void;
  }

  export default confetti;
}
