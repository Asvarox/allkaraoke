import posthog from 'posthog-js';
import { Component, ComponentType, ErrorInfo, PropsWithChildren } from 'react';

export type ErrorFallbackProps = {
  error: unknown;
  resetError: () => void;
};

type Props = PropsWithChildren<{
  fallback: ComponentType<ErrorFallbackProps>;
}>;

type State = {
  error: unknown;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, errorInfo: ErrorInfo) {
    console.error(error, errorInfo);
    posthog.captureException(error, { componentStack: errorInfo.componentStack });
  }

  resetError = () => this.setState({ error: null });

  render() {
    if (this.state.error) {
      const Fallback = this.props.fallback;
      return <Fallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}
