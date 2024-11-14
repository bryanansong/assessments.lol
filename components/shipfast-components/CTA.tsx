import Image from "next/image";
import config from "@/config";
import ButtonLead from "./ButtonLead";

const CTA = () => {
  return (
    <section className="relative min-h-screen overflow-hidden hero">
      <Image
        src="https://images.pexels.com/photos/4990532/pexels-photo-4990532.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
        alt="Background"
        className="object-cover w-full"
        fill
      />
      <div className="relative hero-overlay bg-neutral bg-opacity-70"></div>
      <div className="relative p-8 text-center hero-content text-neutral-content">
        <div className="flex flex-col items-center max-w-xl p-8 md:p-0">
          <h2 className="mb-8 text-3xl font-bold tracking-tight md:text-5xl md:mb-12">
            Compare scores, prep smart, succeed faster
          </h2>
          <p className="mb-12 text-lg opacity-80 md:mb-16">
            Level up your interview game with insights from thousands of real technical assessments...
          </p>

          {/* <button className="btn btn-primary btn-wide">
            Get {config.appName}
          </button> */}
          <ButtonLead />
        </div>
      </div>
    </section>
  );
};

export default CTA;
