import Image from "next/image";

const avatars: {
  alt: string;
  src: string;
}[] = [
  {
    alt: "User",
    // Ideally, load from a statically generated image for better SEO performance (import userImage from "@/public/userImage.png")
    src: "https://images.pexels.com/photos/19753269/pexels-photo-19753269/free-photo-of-portrait-of-a-young-bearded-man-in-a-black-t-shirt-standing-outside.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  },
  {
    alt: "User",
    src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=774&q=80",
  },
  {
    alt: "User",
    src: "https://images.pexels.com/photos/5674943/pexels-photo-5674943.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  },
  {
    alt: "User",
    src: "https://images.pexels.com/photos/15894901/pexels-photo-15894901/free-photo-of-man-with-mustache-and-beard.png?auto=compress&cs=tinysrgb&w=600&lazy=load",
  },
  {
    alt: "User",
    src: "https://images.pexels.com/photos/7138256/pexels-photo-7138256.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load",
  },
];

const TestimonialsAvatars = ({ priority }: { priority?: boolean }) => {
  return (
    <div className="flex flex-col items-center justify-center gap-3 md:flex-row md:items-start">
      {/* AVATARS */}
      <div className={`-space-x-5 avatar-group justy-start`}>
        {avatars.map((image, i) => (
          <div className="w-12 h-12 avatar" key={i}>
            <Image
              src={image.src}
              alt={image.alt}
              priority={priority}
              width={50}
              height={50}
            />
          </div>
        ))}
      </div>

      {/* RATING */}
      <div className="flex flex-col items-center justify-center gap-1 md:items-start">
        <div className="rating">
          {[...Array(5)].map((_, i) => (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 text-yellow-500"
              key={i}
            >
              <path
                fillRule="evenodd"
                d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z"
                clipRule="evenodd"
              />
            </svg>
          ))}
        </div>

        <div className="text-base text-base-content/80">
          <span className="font-semibold text-base-content">21</span> candidates on the waitlist
        </div>
      </div>
    </div>
  );
};

export default TestimonialsAvatars;
