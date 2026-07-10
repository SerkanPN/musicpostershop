if (orderId.trim().toUpperCase() === 'DEMO123') {
      setTimeout(() => {
        navigate('/trend-posters/soundwave?order=DEMO123');
      }, 1000);
      return;
    }

    // ... (supabase kontrolleri)

      const editorPath = data.sku.toLowerCase().includes('soundwave') 
        ? '/trend-posters/soundwave' 
        : '/';

      navigate(`${editorPath}?order=${data.order_id}`);
