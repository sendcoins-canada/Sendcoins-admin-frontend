import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Provider } from "react-redux";
import { store } from "./store";
import NotFound from "@/pages/not-found";

import SetupPassword from "@/pages/SetupPassword";
import ConfirmPassword from "@/pages/ConfirmPassword";
import Transactions from "@/pages/Transactions";
import ManageTeam from "@/pages/ManageTeam";

function Router() {
  return (
    <Switch>
      <Route path="/" component={SetupPassword} />
      <Route path="/setup-password" component={SetupPassword} />
      <Route path="/confirm-password" component={ConfirmPassword} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/team" component={ManageTeam} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
