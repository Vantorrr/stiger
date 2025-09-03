import Image from "next/image";

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <Image
        src="/logoo.png"
        alt="Stiger"
        width={size}
        height={size}
        className="rounded-xl shadow-lg"
      />
      <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
        Stiger
      </span>
    </div>
  );
}


