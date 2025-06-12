import {Box} from '@mantine/core';

export function AnimatedTargetDot({color = 'blue'}: { color: string }) {
    return (
        <Box
            style={{
                position: 'relative',
                width: 18,
                height: 18,
                display: 'inline-block',
            }}
        >
      <span
          style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 18,
              height: 18,
              borderRadius: '50%',
              background: `var(--mantine-color-${color}-4)`,
              boxShadow: `0 0 0 0 var(--mantine-color-${color}-4)`,
              animation: 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite',
              opacity: 0.7,
          }}
      />
            <span
                style={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: `var(--mantine-color-${color}-7)`,
                    border: `2px solid var(--mantine-color-${color}-4)`,
                }}
            />
            <style>
                {`
          @keyframes ping {
            0% { transform: scale(1); opacity: 0.7; }
            70% { transform: scale(1.8); opacity: 0; }
            100% { transform: scale(2); opacity: 0; }
          }
        `}
            </style>
        </Box>
    );
}