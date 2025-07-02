import {
  useDebounce,
  useIntersectionObserver,
  useWindowScroll,
  useWindowSize,
} from "@uidotdev/usehooks";
import { Monoco } from "@monokai/monoco-react";
import { useEffect, useState } from "react";
import {
  extractAudience,
  extractDuration,
  extractPostType,
  extractTags,
  extractTitle,
} from "./Utils/HelperFunctions";
import { AnimatePresence, motion } from "motion/react";
import clsx from "clsx";
import FeatherIcon from "feather-icons-react";

const App = () => {
  const [rawSearch, setRawSearch] = useState<string>("");
  const debouncedSearch = useDebounce(rawSearch, 300);
  const windowSize = useWindowSize();
  const [{}, scrollTo] = useWindowScroll();

  const [results, setResults] = useState<any[]>([]);
  const [isSticky, setIsSticky] = useState(false);

  const clientId = import.meta.env.VITE_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_CLIENT_SECRET;
  const credentials = btoa(`${clientId}:${clientSecret}`);

  const [accessKey, setAccessKey] = useState<string>("");

  const dangerousTags = [
    "Rape",
    "CNC",
    "Incest",
    "LGBTQIA+ Slurs",
    "Orientation Play",
  ];

  useEffect(() => {
    fetch("https://www.reddit.com/api/v1/access_token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": `Smutty Search/1.0 (by /u/daedreem, Current User: u/${
          import.meta.env.VITE_REDDIT_USER
        })`,
      },
      body: "grant_type=client_credentials",
    })
      .then((res) => res.text())
      .then((res) => {
        const data = JSON.parse(res);
        setAccessKey(data.access_token);
      });
  }, []);

  useEffect(() => {
    if (accessKey == "") return;

    fetch(
      `https://oauth.reddit.com/r/gonewildaudio/search/.json?q=${debouncedSearch}&restrict_sr=true&sort=new&include_over_18=on&show=all`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessKey}`,
          "User-Agent": `web:Smutty Search/1.0 (by /u/daedreem, Current User: u/${
            import.meta.env.VITE_REDDIT_USER
          })`,
        },
      }
    )
      .then((res) => res.json())
      .then((json) => setResults(json.data.children || []));
  }, [debouncedSearch, accessKey]);

  const [refCallback, entry] = useIntersectionObserver({
    threshold: 0,
    root: null,
    rootMargin: "0px",
  });

  // Jetzt kannst du isIntersecting aus entry holen, wenn entry nicht null ist:
  const isIntersecting = entry?.isIntersecting ?? false;

  useEffect(() => {
    setIsSticky(isIntersecting);
  }, [isIntersecting]);

  return (
    <div className="wrap">
      <header ref={refCallback} className={clsx(isSticky && "isSticky")}>
        <Monoco
          id="headerWrap"
          borderRadius={windowSize.width! < 768 ? 32 : 64}
          background={"hsl(82, 47%, 56%)"}
        >
          <h1>What are you lookin' for?</h1>
          <div className="input">
            <input
              autoFocus
              className="centerText"
              type="text"
              value={rawSearch}
              onChange={(e) => setRawSearch(e.target.value)}
              placeholder="Search for Audience or Tags..."
            />

            <div className="overlay">
              <FeatherIcon size={24} icon="help-circle" />
              <FeatherIcon
                size={24}
                icon="x"
                onClick={() => {
                  setRawSearch("");
                }}
              />
            </div>
          </div>
        </Monoco>
      </header>
      <main>
        <div className="posts">
          {results &&
            results
              .map((post: any) => post.data)
              .map((result: any) => {
                const tags = extractTags(result.title);
                const audience = extractAudience(result.title);
                const type = extractPostType(result.title);
                const duration = extractDuration(result.title);

                if (result.title == "" || result.title == null) return null;

                return (
                  <AnimatePresence>
                    <motion.div className="post">
                      <h2>
                        <a href={result.url} target="_blank">
                          {type && (
                            <span className="badge space type">{type}</span>
                          )}
                          {audience && (
                            <span className="badge space audience">
                              {audience}
                            </span>
                          )}

                          <span>{extractTitle(result.title)}</span>

                          {duration && (
                            <span className="badge space-left duration">
                              {duration}
                            </span>
                          )}
                        </a>
                      </h2>
                      <div className="tags">
                        {tags.sort().map((tag) => (
                          <span
                            className={clsx(
                              "tag",
                              dangerousTags
                                .map((s) => s.toLowerCase())
                                .includes(tag.toLowerCase()) && "dangerous",
                              debouncedSearch.includes(tag) && "searchedFor"
                            )}
                            onClick={() => {
                              setRawSearch(
                                (prev) => prev.trim() + ' "' + tag + '"'
                              );
                              scrollTo({ top: 0, left: 0, behavior: "smooth" });
                            }}
                            key={tag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="bottomLine">
                        <div className="text-w-icon upvoteRatio">
                          <FeatherIcon icon="thumbs-up" />
                          <p>{result.upvote_ratio * 100}%</p>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                );
              })}
        </div>
      </main>
    </div>
  );
};

export default App;
