<script lang='ts'>
    import Page from "$lib/shared/Page.svelte";
	import Canvas2D from "$lib/shared/Canvas2D.svelte";

    function getHexGrid (size: number) {
        const fillWithCount = (array: number[], start: number) => array.fill(0).map((_, i) => i + start)
        const getRowXValues = (length: number, start: number) => fillWithCount(Array(length), start)
        const getStart = (rowNumber: number) => (Math.abs(rowNumber) / 2) - size;
        const numOfRows = (size * 2) +1
        const rowNums = fillWithCount(Array(numOfRows), -size);
        
        return rowNums.reduce((acc, rowNum) => {
            const rowLength = (size * 2) + 1 - Math.abs(rowNum)
            const rowStart = getStart(rowNum)
            const xValues = getRowXValues(rowLength, rowStart)
            return [...acc, ...xValues.reduce((acc, val) => [...acc, {x: val, y: rowNum}], [])]
        }, [])
    }

    console.log(getHexGrid(2))
</script>

<Page></Page>
<Canvas2D></Canvas2D>
