import { motion } from 'framer-motion';

// Entrada al hacer scroll. Con "reducir animaciones" (MotionConfig) el
// desplazamiento se anula y solo queda el fundido.
export default function Reveal({ as = 'div', delay = 0, y = 24, className, children, ...rest }) {
    const Component = motion[as];
    return (
        <Component
            className={className}
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -12% 0px' }}
            transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
            {...rest}
        >
            {children}
        </Component>
    );
}
