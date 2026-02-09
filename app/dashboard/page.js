"use client";

import { useAuth } from "@/context/AuthContext";
import DashboardNav from "@/components/DashboardNav";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProjectStatusCards from "@/components/ProjectStatusCards";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({
    openProjects: 0,
    dueSoon: 0,
    active: 0,
    pending: 0,
  });
  const [recentProjects, setRecentProjects] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats");
      const data = await res.json();
      if (res.ok) {
        setStats({
          openProjects: data.stats.total, // Or active + pending? Let's use total for "Open Projects" card title context or clarify
          // User's mock said "Open Projects" -> 3. "Active".
          // Let's use 'active' count for "Open Projects" card value?
          // Or Total? let's use Total of non-completed.
          // Actually API returns: total, active, pending, dueSoon.

          // Mapping to UI:
          openProjects: data.stats.active + data.stats.pending,
          dueSoon: data.stats.dueSoon,
          active: data.stats.active,
          pending: data.stats.pending,
        });
        setRecentProjects(data.recentProjects || []);
        setRecentMessages(data.recentMessages || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading)
    return <div className="p-8">Loading Dashboard...</div>;
  if (!user) return <div className="p-8">Access Denied</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* 1. Navigation Row */}
      <DashboardNav role={user.role} />

      {/* 2. Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column (Main Content) */}
        <div className="lg:col-span-3 space-y-6">
          {/* Welcome Row */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Welcome, {user.name}</h1>
            {user.role === "admin" && (
              <Link
                href="/contracts/create"
                className="bg-black rounded-[82px] text-white px-4 py-3 hover:bg-gray-800 text-sm"
              >
                + Create Contract
              </Link>
            )}
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ProjectStatusCards
              title={"Open Projects"}
              status={stats.active}
              icon={
                <svg
                  width="100%" // scale to div
                  height="100%"
                  viewBox="0 0 61 47"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M60.741 13.5721C60.5142 13.2898 60.1675 13.1269 59.7901 13.1269H54.903V7.66387C54.903 6.94767 54.319 6.36477 53.6011 6.36477H21.5439C21.4958 6.36042 21.3933 6.31424 21.3644 6.28897L16.3144 0.629942C15.9835 0.259644 15.4048 0 14.9084 0H1.30102C0.583972 0 0 0.583764 0 1.29909V45.7018C0 46.418 0.583972 47 1.30102 47H52.6109C53.2596 47 53.855 46.5243 53.9959 45.8926L60.9695 14.5941C61.0509 14.2273 60.9677 13.8553 60.741 13.5721ZM14.8987 1.65458C14.9469 1.65981 15.0493 1.70599 15.0782 1.73125L20.1282 7.38941C20.4592 7.76058 21.0379 8.01935 21.5352 8.01935H53.2465V13.1277H15.9275C15.3435 13.1277 14.7446 13.5137 14.5047 14.0443L1.65648 42.3473V1.65458H14.8987ZM52.42 45.348H2.11263L15.9896 14.7814H54.0747V14.6908C54.2218 14.7475 54.3812 14.7814 54.5484 14.7814H59.2307L52.42 45.348Z"
                    fill="black"
                  />
                </svg>
              }
            />
            <ProjectStatusCards
              title={"Pending Projects"}
              status={stats.pending}
              icon={
                <svg
                  width="100%"
                  height="100%"
                  viewBox="0 0 43 65"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M20.6249 35.2457C20.628 35.6811 20.277 36.0373 19.8443 36.0373C19.4116 36.0404 19.0576 35.6872 19.0576 35.2518L19.0062 23.9374V23.8643L18.985 19.2151V19.1755L18.9729 16.8067H18.9699C18.9699 16.7854 18.9699 16.7671 18.9729 16.7458C18.9547 15.8111 18.628 14.9678 18.1075 14.3588C17.6083 13.7712 16.9335 13.4088 16.2043 13.4119H16.2013V13.415C16.1832 13.415 16.165 13.415 16.1468 13.4119C15.4388 13.4332 14.7883 13.7986 14.3072 14.3741C13.7867 14.9982 13.463 15.863 13.4691 16.8189L13.4902 19.2151V19.2334L13.5296 23.8948C13.5296 23.9192 13.5326 23.9466 13.5296 23.9709L13.6657 40.5887C13.6688 41.0241 13.3208 41.3803 12.8881 41.3833C12.64 41.3864 12.4191 41.2707 12.2739 41.091L5.74123 32.9801C5.15725 32.2555 4.32518 31.8415 3.55058 31.814C3.17538 31.8018 2.81835 31.884 2.5158 32.0667C2.21624 32.2494 1.9651 32.5417 1.79869 32.9527C1.38718 33.9636 1.4598 35.6229 2.43713 38.0769C3.17541 39.9281 4.183 42.0625 5.39633 44.3277C6.57031 46.5168 7.93492 48.8338 9.43268 51.1326C10.0469 52.0795 10.6309 53.0173 11.1906 53.9185C14.7005 59.5725 17.1393 63.5002 25.0544 63.4152C26.1951 63.4031 27.2783 63.3148 28.3041 63.1473C29.3177 62.9829 30.2709 62.7393 31.1604 62.4196C31.5689 62.2735 32.0167 62.4866 32.165 62.8976C32.3102 63.3087 32.0984 63.7593 31.6899 63.9085C30.7066 64.2647 29.6596 64.5296 28.5522 64.7123C27.4568 64.8919 26.2949 64.9863 25.0665 64.9985C16.2678 65.0928 13.6381 60.8546 9.85261 54.7589C9.31099 53.8881 8.74516 52.9747 8.1158 52.0065C6.60293 49.6804 5.21408 47.3238 4.01283 45.0859C2.77526 42.7751 1.74047 40.5859 0.977954 38.6738C-0.168839 35.7935 -0.20509 33.7231 0.345564 32.3682C0.651167 31.6192 1.12621 31.0773 1.69809 30.7271C2.26996 30.377 2.92653 30.2217 3.60128 30.2461C4.81159 30.2856 6.08542 30.9068 6.96288 31.9937L12.0825 38.351C12.0432 33.7383 12.0008 29.1286 11.9615 24.5159C9.60136 23.6633 7.56804 22.1167 6.1066 20.1255C4.56647 18.0246 3.6557 15.4336 3.6557 12.6294C3.6557 9.14318 5.05966 5.98285 7.33202 3.69932C9.60438 1.41274 12.7421 0 16.2066 0C19.6711 0 22.8118 1.41274 25.0812 3.69932C27.3535 5.98589 28.7575 9.14326 28.7575 12.6294C28.7575 15.4062 27.8649 17.9729 26.349 20.0615C24.9087 22.0467 22.9087 23.5934 20.5818 24.4672L20.5909 26.7355C21.3262 26.1083 22.2702 25.7216 23.302 25.7003C23.3292 25.6973 23.3565 25.6973 23.3837 25.6973V25.7003C24.5789 25.6973 25.6591 26.1814 26.4488 26.9669C27.2415 27.7555 27.7378 28.8516 27.765 30.0604L27.771 30.307L27.8073 30.2705C28.6061 29.4606 29.6864 28.9491 30.9178 28.9247C30.9602 28.9217 31.0026 28.9217 31.0449 28.9247C32.2915 28.9338 33.4262 29.4484 34.2552 30.2735C34.7303 30.7455 35.1025 31.3209 35.3384 31.9634C35.3505 31.9542 35.3626 31.9451 35.3747 31.936C36.1221 31.3666 37.1206 31.0956 38.2038 31.0773C38.231 31.0743 38.2552 31.0743 38.2825 31.0743V31.0773C42.0223 31.0621 42.9815 34.7188 42.9996 38.8657C43.0117 41.1949 42.7303 43.6398 42.5064 45.6005C42.4459 46.1303 42.3884 46.6296 42.3551 46.9494L42.3521 46.9707C41.9164 50.9683 41.0056 54.2567 39.6199 56.8782C38.2099 59.5545 36.3157 61.5396 33.9435 62.8823C33.5653 63.0954 33.0842 62.9615 32.8724 62.5778C32.6606 62.1972 32.7937 61.7131 33.175 61.5C35.2779 60.3065 36.9663 58.5345 38.228 56.1383C39.52 53.6904 40.3733 50.5909 40.7878 46.8006L40.7908 46.7793C40.8453 46.2647 40.8907 45.8537 40.9421 45.4152C41.163 43.4818 41.4414 41.0705 41.4293 38.8661C41.4142 35.5565 40.7727 32.6397 38.2855 32.6519H38.2825V32.6549C38.2613 32.6549 38.2401 32.6549 38.222 32.6519C37.4655 32.664 36.7907 32.8345 36.3218 33.1938C35.8921 33.5226 35.6259 34.0432 35.6289 34.7923V34.7953H35.6319C35.6319 34.8166 35.6319 34.841 35.6289 34.8623L35.641 37.2372C35.644 37.6726 35.293 38.0288 34.8604 38.0288C34.4277 38.0318 34.0737 37.6787 34.0737 37.2433L34.0616 34.8684C34.0585 34.844 34.0585 34.8197 34.0585 34.7953H34.0616V34.707V34.6674L34.0555 33.5531C34.0525 32.7097 33.7045 31.9455 33.1478 31.3914C32.591 30.8373 31.8285 30.4963 30.9904 30.4993H30.9873C30.1734 30.5023 29.4532 30.8403 28.9237 31.3792C28.3609 31.9516 28.0039 32.7493 27.9555 33.6292L27.8768 35.0024C27.8526 35.4378 27.4835 35.7727 27.0477 35.7483C26.6211 35.724 26.2913 35.3617 26.3064 34.9354L26.2005 30.0851C26.1824 29.3057 25.8616 28.5962 25.3472 28.0817C24.8419 27.5793 24.155 27.2688 23.3926 27.2718H23.3896V27.2748C23.3714 27.2748 23.3503 27.2748 23.3321 27.2718C22.5908 27.2931 21.9161 27.6098 21.4229 28.1091C20.9176 28.6206 20.6059 29.327 20.6119 30.0973L20.618 31.1021L20.624 32.0612L20.6249 35.2457ZM11.9169 19.6904C10.7823 18.9931 9.82914 18.0249 9.1423 16.8771C8.40099 15.6317 7.97134 14.1764 7.97134 12.6267C7.97134 10.3401 8.89117 8.27278 10.3799 6.77477C11.8686 5.27676 13.9261 4.35117 16.1954 4.35117C18.4678 4.35117 20.5222 5.27676 22.0109 6.77477C23.4996 8.27278 24.4195 10.3431 24.4195 12.6267C24.4195 14.1643 24.0019 15.6044 23.2727 16.8405C22.601 17.9792 21.666 18.9444 20.5465 19.6477L20.5616 22.7655C22.368 21.9769 23.9232 20.7134 25.07 19.1332C26.3892 17.3124 27.1699 15.0624 27.1699 12.6296C27.1699 9.57881 25.9414 6.81732 23.9565 4.81961C21.9716 2.8219 19.2272 1.58617 16.195 1.58617C13.1632 1.58617 10.4189 2.82229 8.43357 4.81961C6.44827 6.81693 5.22022 9.5785 5.22022 12.6296C5.22022 15.0867 6.01295 17.352 7.35641 19.1849C8.52435 20.7743 10.1038 22.0378 11.9375 22.8173C11.9314 21.7698 11.923 20.7316 11.9169 19.6904ZM20.5436 17.6961C21.0882 17.2242 21.5542 16.664 21.9233 16.0367C22.5103 15.0412 22.8492 13.875 22.8492 12.6267C22.8492 10.7785 22.1049 9.10702 20.9006 7.89522C19.6964 6.68342 18.0352 5.93445 16.1986 5.93445C14.3619 5.93445 12.7008 6.68345 11.4965 7.89522C10.2923 9.10702 9.54796 10.7785 9.54796 12.6267C9.54796 13.8872 9.89289 15.0655 10.4889 16.0672C10.8672 16.7005 11.3453 17.2638 11.902 17.7387L11.8959 16.8314C11.8899 15.4886 12.3528 14.2616 13.1032 13.3635C13.8687 12.447 14.9338 11.8685 16.1138 11.8381C16.1411 11.8351 16.1683 11.8351 16.1955 11.8351V11.8381C17.4089 11.8351 18.5072 12.4075 19.2969 13.3361C20.0413 14.213 20.5133 15.4126 20.5375 16.731C20.5406 16.7584 20.5406 16.7858 20.5406 16.8101L20.5436 17.6961Z"
                    fill="black"
                  />
                </svg>
              }
            />

            <ProjectStatusCards
              title={"Due Soon"}
              status={stats.dueSoon}
              icon={
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 60 60"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M30 0C24.0666 0 18.2664 1.75947 13.3329 5.05591C8.39943 8.35235 4.55426 13.0377 2.28363 18.5195C0.0129988 24.0013 -0.581101 30.0333 0.576455 35.8527C1.73401 41.6721 4.59123 47.0176 8.78681 51.2132C12.9824 55.4088 18.3279 58.266 24.1473 59.4235C29.9667 60.5811 35.9987 59.987 41.4805 57.7164C46.9623 55.4457 51.6476 51.6006 54.9441 46.6671C58.2405 41.7336 60 35.9334 60 30C59.9909 22.0463 56.8273 14.421 51.2032 8.79685C45.579 3.17273 37.9537 0.00910459 30 0ZM30 58.125C24.4374 58.125 18.9997 56.4755 14.3746 53.3851C9.74947 50.2947 6.14461 45.9021 4.0159 40.763C1.88719 35.6238 1.33022 29.9688 2.41543 24.5131C3.50064 19.0574 6.17928 14.046 10.1126 10.1126C14.046 6.17927 19.0574 3.50062 24.5131 2.41541C29.9688 1.3302 35.6238 1.88717 40.763 4.01589C45.9021 6.1446 50.2947 9.74945 53.3851 14.3746C56.4755 18.9997 58.125 24.4374 58.125 30C58.1165 37.4566 55.1507 44.6054 49.878 49.878C44.6054 55.1506 37.4566 58.1165 30 58.125ZM30 4.6875C24.9937 4.6875 20.0998 6.17205 15.9371 8.95342C11.7745 11.7348 8.53015 15.6881 6.61431 20.3133C4.69847 24.9386 4.1972 30.0281 5.17388 34.9382C6.15057 39.8484 8.56135 44.3586 12.1014 47.8986C15.6414 51.4386 20.1516 53.8494 25.0618 54.8261C29.9719 55.8028 35.0614 55.3015 39.6867 53.3857C44.3119 51.4698 48.2652 48.2255 51.0466 44.0629C53.8279 39.9002 55.3125 35.0063 55.3125 30C55.3049 23.2891 52.6356 16.8552 47.8902 12.1098C43.1448 7.36445 36.7109 4.69515 30 4.6875ZM30 53.4375C25.3645 53.4375 20.8331 52.0629 16.9788 49.4876C13.1246 46.9122 10.1205 43.2518 8.34659 38.9691C6.57266 34.6865 6.10852 29.974 7.01286 25.4276C7.9172 20.8811 10.1494 16.705 13.4272 13.4272C16.705 10.1494 20.8811 7.91718 25.4276 7.01284C29.974 6.1085 34.6865 6.57264 38.9692 8.34657C43.2518 10.1205 46.9122 13.1245 49.4876 16.9788C52.0629 20.8331 53.4375 25.3645 53.4375 30C53.4305 36.2139 50.959 42.1712 46.5651 46.5651C42.1712 50.959 36.2139 53.4305 30 53.4375ZM42.1784 37.0313C42.054 37.2466 41.8492 37.4037 41.609 37.468C41.3688 37.5324 41.1129 37.4988 40.8975 37.3746L29.5312 30.8121C29.5006 30.7884 29.4716 30.7627 29.4443 30.7352C29.3917 30.698 29.3432 30.6553 29.2996 30.6079C29.2621 30.5619 29.229 30.5126 29.2007 30.4605C29.1697 30.4108 29.1439 30.358 29.1238 30.303C29.1042 30.2408 29.0913 30.1767 29.0854 30.1117C29.075 30.0751 29.0674 30.0377 29.0625 30V15C29.0625 14.7514 29.1613 14.5129 29.3371 14.3371C29.5129 14.1613 29.7514 14.0625 30 14.0625C30.2486 14.0625 30.4871 14.1613 30.6629 14.3371C30.8387 14.5129 30.9375 14.7514 30.9375 15V29.4589L41.835 35.75C41.9417 35.8115 42.0353 35.8935 42.1103 35.9912C42.1853 36.0889 42.2404 36.2005 42.2723 36.3195C42.3042 36.4385 42.3123 36.5626 42.2962 36.6847C42.2801 36.8069 42.2401 36.9246 42.1784 37.0313Z"
                    fill="black"
                  />
                </svg>
              }
            />
          </div>

          {/* Projects List Container */}
          <div className="bg-[#0000000F] p-6 rounded-[20px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Projects</h2>
              <Link
                href="/projects"
                className="text-sm font-semibold hover:underline"
              >
                View All...
              </Link>
            </div>

            {recentProjects.length > 0 ? (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <Link
                    key={project._id}
                    href={`/projects/${project._id}`}
                    className="block bg-white p-4 rounded-[20px] shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex gap-x-2 justify-between">
                      <span className="font-bold">{project.title}</span>
                      <div className="text-sm flex text-gray-500 space-x-5">
                        {project.dueDate && (
                          <span>
                            <span className="text-black font-medium">
                              Due Date
                            </span>{" "}
                            : {new Date(project.dueDate).toLocaleDateString()}
                          </span>
                        )}
                        <div className="flex items-center">
                          <span
                            className={`px-2 py-0.5 rounded text-xs font-bold
                                                    ${
                                                      project.status ===
                                                      "Active"
                                                        ? "bg-green-100 text-green-800"
                                                        : project.status ===
                                                            "Pending"
                                                          ? "bg-yellow-100 text-yellow-800"
                                                          : project.status ===
                                                              "Completed"
                                                            ? "bg-gray-200 text-gray-800"
                                                            : "bg-gray-100"
                                                    }`}
                          >
                            {project.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                      {project.description}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent projects found.</p>
            )}
          </div>

          {/* Messages Container */}
          <div className="bg-[#0000000F] p-6 rounded-[20px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Recent Messages</h2>
              <Link
                href="/messages"
                className="text-sm font-semibold hover:underline"
              >
                View All...
              </Link>
            </div>

            {recentMessages.length > 0 ? (
              <div className="space-y-3">
                {recentMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="bg-white p-4 rounded-[20px] shadow-sm"
                  >
                    <div className="flex justify-between">
                      <span className="font-bold text-sm">
                        {msg.sender?.name || "Unknown User"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {msg.project?.title}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 truncate">
                      {msg.type === "text"
                        ? msg.content
                        : `[${msg.type}] Attachment`}
                    </p>
                    <div className="text-[10px] text-gray-400 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recent messages.</p>
            )}
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Actions */}
          <div className="bg-[#0000000F] p-6 rounded-[20px]">
            <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
            <Link
              href="/invoices"
              className="block bg-white p-4 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-center font-medium mb-2"
            >
              View Invoices
            </Link>
            <Link
              href="/messages"
              className="block bg-white p-4 rounded-[15px] shadow-sm hover:shadow-md transition-shadow text-center font-medium"
            >
              Messages
            </Link>
          </div>

          {/* Directory (Admin Only) */}
          {user.role === "admin" && (
            <div className="bg-[#0000000F] p-6 rounded-[20px] space-y-4">
              <h2 className="text-lg font-bold mb-2">Directory</h2>
              <Link
                href="/directory?tab=clients"
                className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="block font-bold">Clients</span>
                <span className="text-xs text-gray-500">View all clients</span>
              </Link>
              <Link
                href="/directory?tab=contractors"
                className="block bg-white p-4 rounded shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="block font-bold">Contractors</span>
                <span className="text-xs text-gray-500">
                  View all contractors
                </span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
