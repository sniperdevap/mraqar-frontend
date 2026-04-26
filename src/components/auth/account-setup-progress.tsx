'use client';

type Step = 'account' | 'subscription';

interface AccountSetupProgressProps {
  step: Step;
}

export function AccountSetupProgress({ step }: AccountSetupProgressProps) {
  const isSubscription = step === 'subscription';

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-medium text-gray-900">Account Setup</h2>
      <p className="text-left text-sm text-primary-body">Create your account to get started.</p>
      <div className="mt-6 flex items-center gap-3">
        {/* Left node */}
        <div className="h-6 w-6 flex items-center justify-center border border-blue-primary rounded-full">
          {' '}
          <div className={`h-3 w-3 rounded-full bg-blue-primary `} />
        </div>
        {/* Progress bar */}
        <div className="flex-1 h-[1px] bg-blue-primary" />
        {/* Right node */}
        <div className="h-6 w-6 flex items-center justify-center border border-blue-primary rounded-full">{isSubscription && <div className={`h-3 w-3 rounded-full bg-blue-primary `} />}</div>
      </div>
      <div className="mt-3 flex justify-between text-xs sm:text-sm text-gray-600">
        <span className="text-primary font-medium">Account Creation</span>
        <span className="text-primary font-medium">Buy Subscription</span>
      </div>
    </div>
  );
}
