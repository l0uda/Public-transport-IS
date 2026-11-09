import React from "react";

// Catches render errors so a broken component does not blank the whole app
// (without it React unmounts the entire tree and only the page background remains).
class ErrorBoundary extends React.Component {
  constructor(props){
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo){
    console.error("Uncaught error in component tree:", error, errorInfo);
  }

  render(){
    if (this.state.hasError){
      return (
        <div className="error-boundary">
          <h3>Něco se pokazilo :(</h3>
          <p>{this.state.error ? String(this.state.error.message) : "Neznámá chyba"}</p>
          <button type="button" className="button-submit" onClick={() => window.location.reload()}>
            Obnovit stránku
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
