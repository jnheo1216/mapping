declare module "nipplejs" {
  export interface JoystickMoveData {
    vector?: {
      x: number;
      y: number;
    };
  }

  export interface JoystickManager {
    on(
      event: "move" | "end",
      handler: (event: Event, data: JoystickMoveData) => void
    ): JoystickManager;
    destroy(): void;
  }

  export interface JoystickOptions {
    zone: HTMLElement;
    mode?: "dynamic" | "semi" | "static";
    color?: string;
    position?: {
      top: string;
      left: string;
    };
    size?: number;
    lockX?: boolean;
    lockY?: boolean;
  }

  const nipplejs: {
    create(options: JoystickOptions): JoystickManager;
  };

  export default nipplejs;
}
