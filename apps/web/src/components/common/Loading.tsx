// Loader.tsx
import { FC } from 'react';
import styles from './Loading.module.css'

type LoaderProps = {
  size?: number;
  color?: string;
};

export const Loading: FC<LoaderProps> = ({
  size = 40,
  color = '#444',
}) => (
  <div
    className={styles.loader}
    role="status"
    aria-label="Loading…"
    style={{width: size, height: size}}
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 40 40"
      aria-hidden="true"
    >
      {/* outer ring */}
      <path
        opacity="0.2"
        fill={color}
        d="M20.201 5.169a14.946 14.946 0 1 0 0 29.892 14.946 14.946 0 0 0 0-29.892zm0 26.58a11.634 11.634 0 1 1 0-23.268 11.634 11.634 0 0 1 0 23.268z"
      />
      {/* rotating arc */}
      <path
        fill={color}
        d="M26.013 10.047 27.667 7.18a15.892 15.892 0 0 0-7.479-2.011v3.312c2.132.001 4.113.577 5.825 1.566z"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          dur="0.5s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </div>
);
