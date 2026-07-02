import { IoWarningOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Button } from "../../components/ui";
import { Routing } from "../../routes/routing";

const ErrorPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white px-6 py-10 shadow-xl sm:px-8">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-4">
            <div className="flex items-center justify-center">
              <IoWarningOutline className="h-16 w-16 text-primary" aria-hidden />
            </div>
          </div>
        </div>
        <div className="mt-6 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            500
          </h1>
          <h3 className="mt-4 text-xl font-bold tracking-tight text-gray-900">Internal Server Error</h3>
          <p className="mt-2 text-base text-gray-600">
            Something went wrong on our end. Please try again later.
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-4">
          <Button onClick={() => window.history.back()} variant="bordered" size="lg" className="w-full">
            Go Back
          </Button>
          <Link to={Routing.Dashboard} className="w-full">
            <Button size="lg" className="w-full">
              Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ErrorPage
