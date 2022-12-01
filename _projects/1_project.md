---
layout: page
title: COVID Hesitancy in United States
description: Interactive Data Visulization
img: assets/img/1.jpg
importance: 1
category: academic
---

<!-- <link rel="stylesheet" href="../covid/styles.css"> -->
<!-- <link href='https://fonts.googleapis.com/css?family=Fira Sans' rel='stylesheet'> -->
<!-- Directly inject the javascript in the html file -->
<!-- <script type="text/javascript" src="../covid/app.js"></script> -->
<!-- <script src="../../assets/js/d3.min.js"></script>
<script src='../../assetsimple-statistics.min.js'></script> -->
<!--<script src="https://cdn.jsdelivr.net/npm/d3-array@3"></script>-->
<!--<script src="https://cdn.jsdelivr.net/npm/d3-geo@3"></script>-->
<!--<script src="https://unpkg.com/topojson@3"></script>-->
<!--<script>-->

<!--const projection = d3.geoEqualEarth();-->
<!--const path = d3.geoPath(projection);-->

<!--</script>-->

Why it is not working injecting html in here...

<div>
    <!-- <h1>Final Project DSC106</h1> -->
    <h2>Author: Scott Yang PID: A16166145</h2>
</div>

<div>
    <h3>Plot 1:</h3>
    <p>Explore the relationship between vaccine hesitancy and social vulnerability.</p>
    <ol>
        <li> <b>Graph Type</b>: Scatter plot </li>
        <li> <b> Keys and Values</b> : Social Vulnerability Index with vaccine hesitancy</li>
       <li> <b>Choice of Color Scheme</b>: Use the plum as the datapoint and they are sub-transparent. Therefore,
           point with higher opacity (darker plum color) means that they have more datapoint to it.
       </li>
        <li> <b>Marks</b>: Marks: Points & Lines.</li>
        <li> <b>Channel</b>: both vertical & horizontal position for
            the Points, The amount of Tilt for the regression line. </li>
    </ol>

    <h4>Plot:</h4>
    <div id="radio_plot1" class="center_plot">
        <div>
            <label>
                <input type="radio" name="hesitant" id="p1a" value="estimated_hesitant_unsure" checked="checked">
            </label> Hesitant or Unsure
            <label>
                <input type="radio" name="hesitant" id="p1b" value="estimated_hesitant">
            </label> Hesitant
            <label>
                <input type="radio" name="hesitant" id="p1c" value="estimated_strongly_hesitant">
            </label> Strongly Hesitant
        </div>
    </div>
    <div id="plot1" class="center_plot"></div>
</div>


