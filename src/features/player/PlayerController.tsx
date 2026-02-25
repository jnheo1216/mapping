"use client";

import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
  useRapier
} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import {
  INPUT_MOVE_DEADZONE,
  PLAYER_ASCEND_SPEED,
  PLAYER_CAPSULE_HALF_HEIGHT,
  PLAYER_CAPSULE_RADIUS,
  PLAYER_EYE_OFFSET,
  PLAYER_JUMP_FORCE,
  PLAYER_MOVE_SPEED
} from "@/lib/constants";
import { useLookStore } from "@/store/useLookStore";

import type { InputAdapter } from "@/features/world/types";

interface PlayerControllerProps {
  desktopInput: InputAdapter;
  mobileInput: InputAdapter;
  spawnPoint: [number, number, number];
  onPositionChange?: (position: { x: number; y: number; z: number }) => void;
}

function mergeMoveAxis(desktopInput: InputAdapter, mobileInput: InputAdapter): {
  x: number;
  y: number;
} {
  const desktopAxis = desktopInput.getMoveAxis();
  const mobileAxis = mobileInput.getMoveAxis();

  const merged = {
    x: Math.max(-1, Math.min(1, desktopAxis.x + mobileAxis.x)),
    y: Math.max(-1, Math.min(1, desktopAxis.y + mobileAxis.y))
  };

  const magnitude = Math.hypot(merged.x, merged.y);
  if (magnitude < INPUT_MOVE_DEADZONE) {
    return { x: 0, y: 0 };
  }

  if (magnitude <= 1 || magnitude === 0) {
    return merged;
  }

  return {
    x: merged.x / magnitude,
    y: merged.y / magnitude
  };
}

export function PlayerController({
  desktopInput,
  mobileInput,
  spawnPoint,
  onPositionChange
}: PlayerControllerProps) {
  const bodyRef = useRef<RapierRigidBody>(null);
  const forwardRef = useRef(new Vector3());
  const rightRef = useRef(new Vector3());
  const directionRef = useRef(new Vector3());
  const lastEmitRef = useRef(0);

  const yaw = useLookStore((state) => state.yaw);
  const pitch = useLookStore((state) => state.pitch);

  const { camera } = useThree();
  const { world, rapier } = useRapier();

  useEffect(() => {
    const body = bodyRef.current;
    if (!body) {
      return;
    }

    body.setTranslation(
      { x: spawnPoint[0], y: spawnPoint[1], z: spawnPoint[2] },
      true
    );
    body.setLinvel({ x: 0, y: 0, z: 0 }, true);
  }, [spawnPoint]);

  useFrame(() => {
    const body = bodyRef.current;

    if (!body) {
      return;
    }

    const axis = mergeMoveAxis(desktopInput, mobileInput);

    const forward = forwardRef.current;
    const right = rightRef.current;
    const direction = directionRef.current;

    forward.set(Math.sin(yaw), 0, -Math.cos(yaw));
    right.set(Math.cos(yaw), 0, Math.sin(yaw));

    direction.set(0, 0, 0);
    direction.addScaledVector(right, axis.x);
    direction.addScaledVector(forward, axis.y);

    if (direction.lengthSq() > 1) {
      direction.normalize();
    }

    const currentVelocity = body.linvel();
    const position = body.translation();

    const jumpRequested =
      desktopInput.consumeJumpPressed() || mobileInput.consumeJumpPressed();
    const ascendPressed =
      desktopInput.isAscendPressed() || mobileInput.isAscendPressed();

    const rayOrigin = {
      x: position.x,
      y: position.y - (PLAYER_CAPSULE_HALF_HEIGHT + PLAYER_CAPSULE_RADIUS) + 0.05,
      z: position.z
    };

    const ray = new rapier.Ray(rayOrigin, { x: 0, y: -1, z: 0 });
    const groundHit = world.castRay(
      ray,
      0.15,
      false,
      undefined,
      undefined,
      undefined,
      body
    );

    const grounded = groundHit !== null;
    const canJump = grounded || Math.abs(currentVelocity.y) < 0.05;
    const nextVerticalVelocity = ascendPressed
      ? PLAYER_ASCEND_SPEED
      : jumpRequested && canJump
        ? PLAYER_JUMP_FORCE
        : grounded && currentVelocity.y < 0
          ? 0
          : currentVelocity.y;

    body.setLinvel(
      {
        x: direction.x * PLAYER_MOVE_SPEED,
        y: nextVerticalVelocity,
        z: direction.z * PLAYER_MOVE_SPEED
      },
      true
    );

    const nextPosition = body.translation();

    camera.rotation.set(pitch, yaw, 0, "YXZ");
    camera.position.set(
      nextPosition.x,
      nextPosition.y + PLAYER_EYE_OFFSET,
      nextPosition.z
    );

    const now = performance.now();
    if (onPositionChange && now - lastEmitRef.current > 50) {
      onPositionChange({
        x: nextPosition.x,
        y: nextPosition.y,
        z: nextPosition.z
      });
      lastEmitRef.current = now;
    }
  });

  return (
    <RigidBody
      ref={bodyRef}
      colliders={false}
      lockRotations
      enabledRotations={[false, false, false]}
      linearDamping={4}
      angularDamping={2}
      mass={1}
    >
      <CapsuleCollider
        args={[PLAYER_CAPSULE_HALF_HEIGHT, PLAYER_CAPSULE_RADIUS]}
        friction={3}
        restitution={0}
      />
    </RigidBody>
  );
}
