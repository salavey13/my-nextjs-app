// components/ConflictAwareness.tsx
"use client";
import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import LoadingSpinner from "./ui/LoadingSpinner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "./ui/Table";

interface NewsItem {
    id: number;
    title: string;
    url: string;
}

interface ResourceItem {
    id: number;
    title: string;
    url: string;
}

interface MapItem {
    id: number;
    title: string;
    url: string;
}

interface AidOrganization {
    id: number;
    name: string;
    donationLink: string;
}

interface ForumPost {
    id: number;
    title: string;
    url: string;
}

interface ImpactData {
    id: number;
    data: string;
}

const ConflictAwareness: React.FC = () => {
    const { t } = useAppContext();
    const [loading, setLoading] = useState(true);
    const [news, setNews] = useState<NewsItem[]>([]);
    const [resources, setResources] = useState<ResourceItem[]>([]);
    const [maps, setMaps] = useState<MapItem[]>([]);
    const [aidOrganizations, setAidOrganizations] = useState<AidOrganization[]>([]);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
    const [impactData, setImpactData] = useState<ImpactData[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedNews = await fetchNews();
                const fetchedResources = await fetchResources();
                const fetchedMaps = await fetchMaps();
                const fetchedAidOrganizations = await fetchAidOrganizations();
                const fetchedForumPosts = await fetchForumPosts();
                const fetchedImpactData = await fetchImpactData();

                setNews(fetchedNews);
                setResources(fetchedResources);
                setMaps(fetchedMaps);
                setAidOrganizations(fetchedAidOrganizations);
                setForumPosts(fetchedForumPosts);
                setImpactData(fetchedImpactData);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
            setLoading(false);
        };

        fetchData();
    }, []);

    if (loading) {
        return <LoadingSpinner />;
    }

    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-4">{t('conflictAwarenessTitle')}</h1>
            
            {/* Real-Time Updates Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('realTimeUpdates')}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("title")}</TableHead>
                            <TableHead>{t("url")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {news.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{item.title}</TableCell>
                                <TableCell>
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.url}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Educational Resources Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('educationalResources')}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("title")}</TableHead>
                            <TableHead>{t("url")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {resources.map((resource) => (
                            <TableRow key={resource.id}>
                                <TableCell>{resource.title}</TableCell>
                                <TableCell>
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                        {resource.url}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            {/* Interactive Maps Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('interactiveMaps')}</h2>
                <div>
                    {maps.map((map) => (
                        <iframe
                            key={map.id}
                            src={map.url}
                            width="100%"
                            height="400"
                            frameBorder="0"
                            allowFullScreen
                            title={map.title}
                        />
                    ))}
                </div>
            </Card>

            {/* Humanitarian Aid and Donations Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('humanitarianAid')}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("organization")}</TableHead>
                            <TableHead>{t("donationLink")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {aidOrganizations.map((org) => (
                            <TableRow key={org.id}>
                                <TableCell>{org.name}</TableCell>
                                <TableCell>
                                    <a href={org.donationLink} target="_blank" rel="noopener noreferrer">
                                        {org.donationLink}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Button onClick={() => { /* Donation Logic */ }}>{t('donateNow')}</Button>
            </Card>

            {/* Discussion Forums Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('discussionForums')}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("title")}</TableHead>
                            <TableHead>{t("url")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {forumPosts.map((post) => (
                            <TableRow key={post.id}>
                                <TableCell>{post.title}</TableCell>
                                <TableCell>
                                    <a href={post.url} target="_blank" rel="noopener noreferrer">
                                        {post.url}
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <Input placeholder={t('postComment')} />
                <Button onClick={() => { /* Post Comment Logic */ }}>{t('post')}</Button>
            </Card>

            {/* Impact Analytics Section */}
            <Card>
                <h2 className="text-2xl font-semibold">{t('impactAnalytics')}</h2>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("id")}</TableHead>
                            <TableHead>{t("data")}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {impactData.map((data) => (
                            <TableRow key={data.id}>
                                <TableCell>{data.id}</TableCell>
                                <TableCell>{data.data}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};

export default ConflictAwareness;

// Mock API Calls
const fetchNews = async (): Promise<NewsItem[]> => {
    return [
        { id: 1, title: "Latest Conflict Updates on 9GAG", url: "https://9gag.com/tag/ukraine" },
        { id: 2, title: "NAFO 69th Sniffin' Brigade Twitter Updates", url: "https://twitter.com/69thSB" },
    ];
};

const fetchResources = async (): Promise<ResourceItem[]> => {
    return [
        { id: 1, title: "NAFO Wikipedia Entry", url: "https://en.wikipedia.org/wiki/NAFO" },
        { id: 2, title: "Educational Resources on the Conflict", url: "https://www.someeducationalsite.com/conflict" },
    ];
};

const fetchMaps = async (): Promise<MapItem[]> => {
    return [
        { id: 1, title: "Live Conflict Map", url: "https://www.liveuamap.com/" },
    ];
};

const fetchAidOrganizations = async (): Promise<AidOrganization[]> => {
    return [
        { id: 1, name: "United24 - Ukraine's Official Aid", donationLink: "https://u24.gov.ua/" },
        { id: 2, name: "Come Back Alive", donationLink: "https://savelife.in.ua/en/donate/" },
    ];
};

const fetchForumPosts = async (): Promise<ForumPost[]> => {
    return [
        { id: 1, title: "9GAG Discussion on Conflict", url: "https://9gag.com/interest/ukrainenews" },
        { id: 2, title: "NAFO Supporters Forum", url: "https://nafo.net/" },
    ];
};

const fetchImpactData = async (): Promise<ImpactData[]> => {
    return [
        { id: 1, data: "Impact statistics from various sources." },
    ];
};