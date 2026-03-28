document.addEventListener('DOMContentLoaded', () => {
    const progressBar = document.getElementById('progress-bar');
    const statusMessage = document.getElementById('status-message');
    const orderId = window.location.pathname.split('/').pop();
    const userId = 1; // Hardcoded for demo
    
    const payBtn = document.getElementById('pay-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const reorderBtn = document.getElementById('reorder-btn');

    const steps = ['pending', 'cooking', 'delivery', 'completed'];

    function updateProgress(currentStatus) {
        const isCancelled = currentStatus === 'cancelled';
        
        if (payBtn) payBtn.style.display = currentStatus === 'pending' ? 'block' : 'none';
        if (cancelBtn) cancelBtn.style.display = (currentStatus === 'pending' || currentStatus === 'cooking') ? 'block' : 'none';
        if (reorderBtn) reorderBtn.style.display = (currentStatus === 'completed' || currentStatus === 'cancelled') ? 'block' : 'none';

        if (isCancelled) {
            progressBar.querySelectorAll('.progress-step').forEach(step => step.classList.remove('active'));
            const cancelledStep = progressBar.querySelector('[data-status="cancelled"]');
            if (cancelledStep) {
                cancelledStep.style.display = 'block';
                cancelledStep.classList.add('active');
                cancelledStep.style.color = 'red';
                cancelledStep.innerHTML = 'Order Cancelled';
            }
            return;
        }

        const currentIndex = steps.indexOf(currentStatus);
        progressBar.querySelectorAll('.progress-step').forEach((step, index) => {
            if (index <= currentIndex) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }

    // Fetch initial state
    fetch(`/api/order/${orderId}`).then(res => res.json()).then(data => updateProgress(data.status));

    // Connect to WebSocket for real-time updates (Observer)
    const socket = io();
    socket.on('connect', () => {
        socket.emit('join_order_room', { orderId, userId });
    });

    socket.on('order_status_update', (data) => {
        statusMessage.textContent = `Update: ${data.message}`;
        updateProgress(data.status);
    });

    // --- Button Handlers ---
    if (payBtn) payBtn.onclick = () => window.location.href = `/payment/${orderId}`;
    
    if (cancelBtn) cancelBtn.onclick = async () => {
        try {
            const res = await fetch(`/api/order/${orderId}/cancel`, { method: 'POST' });
            if (!res.ok) throw new Error((await res.json()).message);
            window.location.reload();
        } catch (e) { alert(`State Pattern Exception:\n${e.message}`); }
    };

    if (reorderBtn) reorderBtn.onclick = async () => {
        const res = await fetch(`/api/order/${orderId}/reorder`, { method: 'POST' });
        window.location.href = `/order-tracking/${(await res.json()).orderId}`;
    };
});