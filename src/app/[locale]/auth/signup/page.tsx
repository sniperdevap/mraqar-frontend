import { Metadata } from "next";
import { SignupForm } from "./components/signup-form";

export const metadata: Metadata = {
  title: "Sign Up - Mr aqar",
  description: "Create your Mr aqar account",
};

export default function SignUp() {
  return <SignupForm />;
}
