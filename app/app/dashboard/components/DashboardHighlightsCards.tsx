import TranslucentCard from "@/app/TranslucentCard";
import Image from "next/image";

interface DashboardHighlightsCardProps {
    title: string,
    figure: string,
    iconPath: string
}
 
const DashboardHighlightsCard: React.FC<DashboardHighlightsCardProps> = ({ title, figure, iconPath }: DashboardHighlightsCardProps) => {
    return (
        <TranslucentCard className="md:p-4 p-2 rounded-2xl flex flex-col items-start">
            <div className="flex justify-between items-center w-full">
                <p className="text-sm md:text-base font-medium text-neutral-800 whitespace-nowrap text-ellipsis overflow-hidden">{title}</p>
                <Image
                    src={iconPath}
                    alt="dollar logo"
                    className="rounded-full"
                    width={20}
                    height={20}
                />
            </div>
            <div className="md:mt-5 text-neutral text-[28px] font-medium">{figure}</div>
        </TranslucentCard>
    );
}
 
export default DashboardHighlightsCard;