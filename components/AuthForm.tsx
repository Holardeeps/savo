"use client";

import { useState } from "react";

import Image from "next/image";
import Link from "next/link";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "./ui/form";
import { Button } from "./ui/button";
import CustomFormInput from "./CustomFormInput";
import { authFormSchema } from "@/lib/utils";
import { Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/actions/user.actions";
import PlaidLink from "./PlaidLink";

const AuthForm = ({ type }: { type: string }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const formSchema = authFormSchema(type);

  //   Defining the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  //   Creating a submit handler for the form
  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);

    try {
      const userData = {
        firstName: data.firstName!,
        lastName: data.lastName!,
        address1: data.address1!,
        city: data.city!,
        state: data.state!,
        postalCode: data.postalCode!,
        dateOfBirth: data.dateOfBirth!,
        ssn: data.ssn!,
        email: data.email,
        password: data.password,
      };

      if (type === "sign-up") {
        const newUser = await signUp(userData);
        setUser(newUser);
      }

      if (type === "sign-in") {
        const response = await signIn({
          email: data.email,
          password: data.password,
        });
        if (response) router.push("/");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }

    // console.log(values);
  };

  return (
    <section className="flex min-h-screen w-full max-w-105 flex-col justify-center gap-5 py-10 md:gap-8">
      <header className="flex flex-col gap-5 md:gap-8">
        <Link href={"/"} className="flex cursor-pointer items-center gap-1">
          <Image
            src={"/icons/logo.svg"}
            width={34}
            height={34}
            alt="Savo finance logo"
            // className='size-8  max-xl:size-14'
          />
          <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">
            Savo
          </h1>
        </Link>

        <div className="flex flex-col gap-1 md:gap-3">
          <h1 className="text-24 lg:text-36 font-semibold text-gray-900">
            {user ? "Link Account" : type === "sign-in" ? "Sign In" : "Sign Up"}

            <p className="text-16 font-normal text-gray-600">
              {user
                ? "Link your account to get started."
                : "Please enter your details."}
            </p>
          </h1>
        </div>
      </header>

      {user ? (
        <div className="flex flex-col gap-4">
          <PlaidLink user={user} variant={"primary"} />
        </div>
      ) : (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {type === "sign-up" && (
                <>
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="firstName"
                      label="First Name"
                      placeholder="Enter your first name..."
                    />
                    <CustomFormInput
                      control={form.control}
                      name="lastName"
                      label="Last Name"
                      placeholder="Enter your last name..."
                    />
                  </div>
                  <CustomFormInput
                    control={form.control}
                    name="address1"
                    label="Address"
                    placeholder="Enter your address..."
                  />
                  <CustomFormInput
                    control={form.control}
                    name="city"
                    label="City"
                    placeholder="Enter your city..."
                  />
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="state"
                      label="State"
                      placeholder="Example: NY"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="postalCode"
                      label="Postal Code"
                      placeholder="Example: 121010"
                    />
                  </div>
                  <div className="flex gap-4">
                    <CustomFormInput
                      control={form.control}
                      name="dateOfBirth"
                      label="Date of Birth"
                      placeholder="YYYY-MM-DD"
                    />
                    <CustomFormInput
                      control={form.control}
                      name="ssn"
                      label="SSN"
                      placeholder="Example: 234-343-556"
                    />
                  </div>
                </>
              )}

              <CustomFormInput
                control={form.control}
                name="email"
                label="email"
                placeholder="Enter your email..."
              />
              <CustomFormInput
                control={form.control}
                name="password"
                label="password"
                placeholder="Enter your password..."
              />
              <div className="flex flex-col gap-4">
                <Button
                  type="submit"
                  className="form-btn cursor-pointer"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader size={20} className="animate-spin" /> &nbsp;
                      Loading...
                    </>
                  ) : type === "sign-in" ? (
                    "Sign In"
                  ) : (
                    "Sign Up"
                  )}
                </Button>
              </div>
            </form>
          </Form>

          <footer className="flex justify-center gap-1">
            <p className="text-14 font-normal text-gray-600">
              {type === "sign-in"
                ? "Dont have an account?."
                : "Already have an account?."}
            </p>
            <Link
              href={type === "sign-in" ? "/sign-up" : "/sign-in"}
              className="form-link"
            >
              {type === "sign-in" ? "Sign up" : "Sign in"}
            </Link>
          </footer>
        </>
      )}
    </section>
  );
};

export default AuthForm;
