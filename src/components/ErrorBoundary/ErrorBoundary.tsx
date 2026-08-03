import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='py-16 text-center'>
          <h1 className='text-3xl font-bold'>:'(</h1>
          <p className='mt-4'>Something went wrong, we're sad</p>
          <a href='/' className='mt-6 inline-block underline'>
            Back home
          </a>
        </div>
      )
    }
    return this.props.children
  }
}
