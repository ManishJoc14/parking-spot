import { Search, Ticket, User, Wallet } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      icon: <User className="text-white fill-primary" />,
      title: "Sign Up",
      description: "Create an account to start renting parking spaces.",
    },
    {
      icon: <Search className="text-white fill-primary" />,
      title: "Browse & Select Parking Space",
      description: "Find and choose the perfect parking space for your needs.",
    },
    {
      icon: <Wallet className="text-white fill-primary" />,
      title: "Complete Payment",
      description: "Securely pay for your selected parking space.",
    },
    {
      icon: <Ticket className="text-white fill-primary" />,
      title: "Your Booking is Confirmed!",
      description:
        "Receive confirmation and details of your parking reservation.",
    },
  ];

  return (
    <section id="how-it-works" className="container mx-auto py-16 px-8">
      <div className="flex items-center justify-center space-x-2 mb-2">
        <span className="h-1 w-8 bg-green-500 rounded-xl"></span>
        <span className="text-muted-foreground rounded-lg px-2 py-1.5 text-md uppercase sm:text-md font-mont-semibold">
          How It Works?
        </span>
      </div>
      <h2 className="text-2xl text-center sm:text-4xl font-mont-bold text-gray-800">
        Guide to <span className="text-primary">Renting Parking</span>
        <span className="block">
          {" "}
          <span className="text-primary">Space</span> Step-by-Step:
        </span>
      </h2>

      {/* Left Side: Services */}
      <div className="flex flex-col justify-center items-center lg:flex-row gap-2 lg:gap-4 mt-16">
        <div className="AnimatedImage max-w-lg w-full h-full aspect-square flex-1 rounded-lg">
        </div>
        <div className="space-y-2 relative">
          {/* <div className="absolute inset-6 -left-8 sm:-left-16 md:inset-8 bg-violet-600 -z-10 rounded-2xl md:-left-10"></div> */}
        </div>

        {/* Right Side: Steps */}
        <div className="px-4 sm:px-8">
          <div className="space-y-4 divide-y divide-green-400 divide-dashed">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-4 py-6">
                <div className="flex items-center bg-transparent justify-center h-16 w-16 rounded-xl sm:bg-secondary text-white text-lg font-bold">
                  <span className="bg-primary p-2 rounded-full">
                    {step.icon}
                  </span>
                </div>
                <div>
                  <h3 className="text-md sm:text-xl font-mont-medium">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
