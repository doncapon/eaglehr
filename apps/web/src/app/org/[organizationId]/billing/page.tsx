import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eaglehr/ui";
import { Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { BoostCompanyButton } from "./boost-company-button";
import { PlanCheckoutButton } from "./plan-checkout-button";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  priceKobo: number;
  billingInterval: string;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  plan: Plan;
}

interface Organization {
  id: string;
  isBoosted: boolean;
  boostExpiresAt: string | null;
}

interface BillingPageProps {
  params: Promise<{ organizationId: string }>;
}

function formatNaira(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG")}`;
}

export default async function BillingPage({ params }: BillingPageProps) {
  const { organizationId } = await params;
  const [plans, subscription, organization] = await Promise.all([
    apiFetch<Plan[]>("/plans"),
    apiFetch<Subscription | null>(`/organizations/${organizationId}/billing/subscription`),
    apiFetch<Organization>(`/organizations/${organizationId}`),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Billing</h1>
        {subscription ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Current plan: <span className="font-medium">{subscription.plan.name}</span> &middot;{" "}
            <Badge variant={subscription.status === "ACTIVE" ? "success" : "secondary"}>{subscription.status}</Badge>
          </p>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No active subscription yet — jobs can still be posted for free during your trial.
          </p>
        )}
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-2xl font-bold">
                {formatNaira(plan.priceKobo)}
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                  {" "}
                  /{plan.billingInterval.toLowerCase()}
                </span>
              </p>
              <ul className="flex flex-col gap-1 text-sm text-gray-600 dark:text-gray-300">
                {plan.features.map((feature) => (
                  <li key={feature}>&#10003; {feature}</li>
                ))}
              </ul>
              <PlanCheckoutButton organizationId={organizationId} planId={plan.id} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent-500" aria-hidden />
            Company boost
          </CardTitle>
          <CardDescription>
            Get your company featured at the top of the companies directory and job listings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {organization.isBoosted && organization.boostExpiresAt ? (
            <Badge variant="warning" className="gap-1">
              <Sparkles className="h-3 w-3" aria-hidden />
              Featured until {new Date(organization.boostExpiresAt).toLocaleDateString("en-NG")}
            </Badge>
          ) : (
            <BoostCompanyButton organizationId={organizationId} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
