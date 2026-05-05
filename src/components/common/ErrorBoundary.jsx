import React from 'react';

/**
 * ErrorBoundary — captura errores de renderizado en el subárbol de componentes
 * y muestra un mensaje de recuperación en lugar de una pantalla en blanco.
 *
 * Uso:
 *   <ErrorBoundary>
 *     <ComponenteQuePuedeFallar />
 *   </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        // En producción podrías enviar esto a un servicio de telemetría
        console.error('[ErrorBoundary] Error capturado:', error, info.componentStack);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div
                    role="alert"
                    className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center"
                >
                    <p className="text-5xl mb-4">⚠️</p>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                        Algo salió mal
                    </h2>
                    <p className="text-gray-500 mb-6 max-w-md">
                        Ocurrió un error inesperado en esta sección. Puedes intentar
                        recargarla sin perder el resto de la aplicación.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors"
                    >
                        Reintentar
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
