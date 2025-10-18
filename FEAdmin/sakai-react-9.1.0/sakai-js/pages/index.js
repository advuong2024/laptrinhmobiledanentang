import React, { useState, useEffect, useContext } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Chart } from 'primereact/chart';
import { LayoutContext } from '../layout/context/layoutcontext';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/orders';

const RevenueDashboard = () => {
    const { layoutConfig } = useContext(LayoutContext);

    // ==================== STATE ====================
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        totalRevenue: 0
    });
    const [chartData, setChartData] = useState(null);
    const [chartOptions, setChartOptions] = useState(null);
    const [loading, setLoading] = useState(true);

    const [filterType, setFilterType] = useState(null);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [error, setError] = useState('');

    const filterTypes = [
        { label: 'Tuần', value: 'tuan' },
        { label: 'Tháng', value: 'thang' },
        { label: 'Quý', value: 'quy' },
        { label: 'Năm', value: 'nam' }
    ];


    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchStatsData = async () => {
        try {
            setLoading(true);
            const [completedRes, allRes, revenueRes] = await Promise.all([
                axios.get(`${API_BASE}/count/completed`),
                axios.get(`${API_BASE}/count/all`),
                axios.get(`${API_BASE}/revenue/month`)
            ]);

            setStats({
                totalOrders: allRes.data.total_orders || 0,
                completedOrders: completedRes.data.total_completed_orders || 0,
                totalRevenue: revenueRes.data.total_revenue || 0
            });
        } catch (err) {
            console.error('❌ Lỗi khi lấy thống kê:', err);
            setStats({ totalOrders: 0, completedOrders: 0, totalRevenue: 0 });
        } finally {
            setLoading(false);
        }
    };

    const fetchChartData = async (filter, start, end) => {
        try {
            setLoading(true);

            // Xây URL động theo điều kiện
            const params = {};
            if (filter) params.filter = filter;
            if (start && end) {
                params.startDate = start;
                params.endDate = end;
            }

            const res = await axios.get(`${API_BASE}/chart`, { params });

            const { labels, datasets } = res.data;

            setChartData({
                labels: labels || [],
                datasets: datasets || [
                    {
                        label: 'Doanh thu (VNĐ)',
                        backgroundColor: '#6f42c1',
                        data: []
                    }
                ]
            });
        } catch (err) {
            console.error('❌ Lỗi khi lấy biểu đồ:', err);
            setChartData({
                labels: [],
                datasets: [
                    {
                        label: 'Doanh thu (VNĐ)',
                        backgroundColor: '#6f42c1',
                        data: []
                    }
                ]
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFilter = () => {
        // Nếu cả hai đều trống
        if (!filterType && (!startDate || !endDate)) {
            setError('Vui lòng chọn kiểu lọc hoặc nhập khoảng thời gian hợp lệ.');
            return;
        }

        setError('');

        if (startDate && endDate) {
            // 🔹 Ưu tiên lọc theo khoảng ngày khi người dùng chọn
            fetchChartData(null, formatDate(startDate), formatDate(endDate));
        } else if (filterType) {
            // 🔹 Lọc theo kiểu có sẵn (tuần/tháng/quý/năm)
            fetchChartData(filterType, '', '');
        }
    };

    const resetPage = () => window.location.reload();

    const baseChartOptions = (isDark) => ({
        plugins: {
            legend: {
                position: 'top',
                labels: { color: isDark ? '#ebedef' : '#495057' }
            }
        },
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    color: isDark ? '#ebedef' : '#495057',
                    callback: (v) => v.toLocaleString('vi-VN')
                },
                grid: {
                    color: isDark
                        ? 'rgba(160, 167, 181, .3)'
                        : '#ebedef'
                }
            },
            x: {
                ticks: { color: isDark ? '#ebedef' : '#495057' },
                grid: {
                    color: isDark
                        ? 'rgba(160, 167, 181, .3)'
                        : '#ebedef'
                }
            }
        }
    });

    useEffect(() => {
        setChartOptions(baseChartOptions(layoutConfig.colorScheme === 'dark'));
    }, [layoutConfig.colorScheme]);

    useEffect(() => {
        fetchStatsData();
        fetchChartData('thang', '', '');
    }, []);

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div className="grid">
            {/* Cards */}
            {[
                {
                    title: 'Tổng số đơn',
                    value: stats.totalOrders,
                    icon: 'pi-shopping-cart'
                },
                {
                    title: 'Đơn hoàn thành',
                    value: stats.completedOrders,
                    icon: 'pi-check-circle'
                },
                {
                    title: 'Tổng doanh thu',
                    value: `${stats.totalRevenue.toLocaleString('vi-VN')}đ`,
                    icon: 'pi-wallet'
                }
            ].map((item, i) => (
                <div className="col-12 md:col-4" key={i}>
                    <div className="card mb-0">
                        <div className="flex justify-content-between mb-3">
                            <div>
                                <span className="block text-500 font-medium mb-3">{item.title}</span>
                                <div className="text-900 font-medium text-xl">{item.value}</div>
                            </div>
                            <div
                                className="flex align-items-center justify-content-center bg-purple-100 border-round"
                                style={{ width: '3.5rem', height: '3.5rem' }}
                            >
                                <i className={`pi pi-fw ${item.icon} text-purple-500 text-xl`} />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Bộ lọc */}
            <div className="col-12">
                <div className="card">
                    <h5>Lọc dữ liệu biểu đồ</h5>
                    <div className="grid">
                        <div className="col-12 md:col-4">
                            <label>Ngày bắt đầu</label>
                            <Calendar
                                showIcon
                                dateFormat="dd/mm/yy"
                                className="w-full"
                                value={startDate}
                                onChange={(e) => {
                                    setStartDate(e.value);
                                    if (e.value && endDate) setFilterType(null);
                                }}
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label>Ngày kết thúc</label>
                            <Calendar
                                showIcon
                                dateFormat="dd/mm/yy"
                                className="w-full"
                                value={endDate}
                                onChange={(e) => {
                                    setEndDate(e.value);
                                    if (startDate && e.value) setFilterType(null);
                                }}
                            />
                        </div>
                        <div className="col-12 md:col-4">
                            <label>Lọc theo</label>
                            <Dropdown
                                options={filterTypes}
                                value={filterType}
                                onChange={(e) => {
                                    setFilterType(e.value);
                                    if (e.value) {
                                        setStartDate(null);
                                        setEndDate(null);
                                    }
                                }}
                                placeholder="Chọn kiểu lọc"
                                className="w-full"
                            />
                        </div>

                        <div className="col-12 md:col-2 flex align-items-end">
                            <Button
                                label="Lọc dữ liệu"
                                onClick={handleFilter}
                                className="w-full p-button-raised"
                                disabled={loading}
                            />
                        </div>
                        <div className="col-12 md:col-1 flex align-items-end">
                            <Button
                                icon="pi pi-refresh"
                                onClick={resetPage}
                                className="w-full p-button-raised"
                            />
                        </div>
                    </div>

                    {error && <div className="text-red-500 mt-2">{error}</div>}
                </div>
            </div>

            {/* Biểu đồ */}
            <div className="col-12">
                <div className="card">
                    <h5 className="text-center">Biểu đồ doanh thu</h5>
                    {chartData ? (
                        <Chart type="bar" data={chartData} options={chartOptions} />
                    ) : (
                        <div>Vui lòng chọn kiểu lọc để xem biểu đồ.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RevenueDashboard;
