import Image from "next/image";
import Link from "next/link";
import styles from "@/styles/NavBar.module.css"

const NavBar: React.FC = () => {
    return(
        <>
            <div className={styles.navBar}>
                    <Image
                        src="/assets/logo.svg"
                        alt="Logo"
                        width={25}
                        height={20}
                        className={styles.logo}
                    />
                <div className={styles.navBarItems}>
                    <Link href="/dashboard">
                        <Image
                            src="/assets/icon-nav-home.svg"
                            alt="Home nav icon"
                            width={16}
                            height={16}
                            className={styles.navIcon}
                        />
                    </Link>
                    <Link href="/movies">
                        <Image
                            src="/assets/icon-nav-movies.svg"
                            alt="Movies nav icon"
                            width={16}
                            height={16}
                            className={styles.navIcon}
                        />
                    </Link>
                    <Link href="/tvseries">
                        <Image
                            src="/assets/icon-nav-tv-series.svg"
                            alt="Series nav icon"
                            width={16}
                            height={16}
                            className={styles.navIcon}
                        />
                    </Link>
                    <Link href="/bookmarks">
                        <Image
                            src="/assets/icon-nav-bookmark.svg"
                            alt="Bookmark nav icon"
                            width={16}
                            height={16}
                            className={styles.navIcon}
                        />
                    </Link>
                </div>
            </div>
        </>
    );
}

export default NavBar;