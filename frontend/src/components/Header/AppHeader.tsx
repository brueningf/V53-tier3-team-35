"use client";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { Header } from "antd/es/layout/layout";
import Image from "next/image";
import UserMenu from "../UserMenu";
import { Menu } from "antd";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

const scrollHandler = () => {
    const header = document.querySelector(".ant-layout-header");
    const logo = document.querySelector(".ant-layout-header .logo");
    if (header) {
        if (window.scrollY > 10) {
            header.classList.add("bg-white");
            header.classList.remove("bg-transparent");
            logo?.classList.remove("invisible");
        } else {
            header.classList.remove("bg-white");
            header.classList.add("bg-transparent");
            logo?.classList.add("invisible");
        }
    }
};

export default function AppHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [isHomepage, setIsHomepage] = useState(pathname === "/");

    useEffect(() => {
        setIsHomepage(pathname === "/");

        if (isHomepage) {
            document.querySelector(".main-section")?.classList.remove("mt-[84px]");
            document.querySelector(".main-section")?.classList.remove("pt-12");
            window.addEventListener("scroll", scrollHandler);
        } else {
            document.querySelector(".main-section")?.classList.add("mt-[84px]");
            document.querySelector(".main-section")?.classList.add("pt-12");
            window.removeEventListener("scroll", scrollHandler);
        }
    });

    const menuItems = useMemo(() => {
        const items = [
            {
                key: "home",
                label: <Link href="/">Home</Link>,
            },
            {
                key: "courses",
                label: <Link href="/courses">Courses</Link>,
            },
            {
                key: "team",
                label: <Link href="/our-team">Team</Link>,
            },
        ];

        if (session) {
            items.push({
                key: "user",
                label: <UserMenu />,
            });
        } else {
            items.push({
                key: "signin",
                label: <Link href="/auth/signin">Sign In</Link>,
            });
        }

        return items;
    }, [session]);

    return (
        <>
            <Header
                className={`w-full fixed top-0 inset-x-0 z-50 h-fit ${isHomepage ? "bg-transparent" : "bg-white shadow-sm"}`}
            >
                <div className="lg:container mx-auto flex items-center justify-between">
                    <Link
                        href={"/"}
                        className={`logo ${isHomepage ? "invisible" : ""}`}
                    >
                        <Image
                            src="/Logo_LightM.png"
                            alt="Logo"
                            width={225}
                            height={75}
                        />
                    </Link>

                    <Menu
                        mode="horizontal"
                        items={menuItems}
                        className={`bg-transparent flex items-center justify-end border-none text-xl ${isHomepage ? "text-white" : "text-black"}`}
                        style={{ flex: 1, minWidth: 0 }}
                    />
                </div>
            </Header>
        </>
    );
}
