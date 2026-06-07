import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

// Images ko import karo
import banner1 from "../assets/images/banner1.jpg";
import banner2 from "../assets/images/banner2.jpg";
import banner3 from "../assets/images/banner3.jpg";

const banners = [banner1, banner2, banner3];

function BannerSlider() {
  return (
    <Swiper spaceBetween={10} slidesPerView={1} autoplay={{ delay: 3000 }} loop={true}>
      {banners.map((url, i) => (
        <SwiperSlide key={i}>
          <img src={url} alt={`Banner ${i + 1}`} style={{ width: "100%", borderRadius: 10 }} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
export default BannerSlider;
