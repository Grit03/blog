"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";
import { GithubIcon } from "@/components/icons/GithubIcon";

export function MainNav() {
  return (
    <nav className="text-quiet flex items-center gap-3 text-sm font-medium">
      <ThemeToggle />
      <Button
        variant="ghost"
        size="lg"
        asChild
        className="hidden font-semibold sm:flex"
      >
        <Link
          href="https://github.com/Grit03"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-background-highlight transition-colors"
        >
          <GithubIcon className="size-4" />
          Github
        </Link>
      </Button>
      <Button
        variant="default"
        size="lg"
        className="font-semibold"
        onClick={() => {
          alert("구독하기 기능은 준비 중입니다.");
        }}
      >
        구독하기
      </Button>
    </nav>
  );
}
