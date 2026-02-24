import Link from "next/link";

export default function Navigation() {
    return (
        <nav>
            <ul>
                <li>
                    <Link href='/about'>About 2</Link>
                </li>
                <li>
                    <Link href='/contact'>Contact</Link>
                </li>
                <li>
                    <Link href='/blog'>Blog</Link>
                </li>
            </ul>
        </nav>
    );
}